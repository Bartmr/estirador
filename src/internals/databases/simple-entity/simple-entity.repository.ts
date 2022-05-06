import {
  Class,
  ConcreteClass,
} from 'libs/shared/src/internals/utils/types/classes-types';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  AbstractRepository,
  DeepPartial,
  EntityManager,
  FindOperator,
  SelectQueryBuilder,
} from 'typeorm';
import { SimpleEntity } from './simple.entity';
import { throwError } from 'src/internals/utils/throw-error';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UnwrapPromise } from 'libs/shared/src/internals/utils/types/promise-types';

type AnyEntity = {
  id: number | string;
};

type WhereEntityAttribute<Attribute> = Attribute extends null | undefined
  ? /*
      enforce the use of TypeORM's IsNull operator for null values
      and stop undefined from being considered an entity attribute
      and have FindOperators of its own, even in relationships
    */
    never
  : Attribute extends AnyEntity
  ? Attribute | Attribute['id']
  : Attribute extends AnyEntity[]
  ? Attribute[number] | Attribute[number]['id']
  : Attribute | FindOperator<Attribute>;

type WhereObject<Entity extends SimpleEntity> = {
  [K in keyof Entity]?: Entity[K] extends Promise<unknown>
    ? WhereEntityAttribute<UnwrapPromise<Entity[K]>>
    : WhereEntityAttribute<Entity[K]>;
};

export type Where<Entity extends SimpleEntity> =
  | WhereObject<Entity>
  | Array<WhereObject<Entity>>;

type FindOptionsBase<Entity extends SimpleEntity> = {
  withDeleted?: boolean;
  order?: {
    [K in keyof Entity]?: 'ASC' | 'DESC' | 1 | -1;
  };
};

export interface FindOneOptions<Entity extends SimpleEntity>
  extends FindOptionsBase<Entity> {
  where: Where<Entity>;
}

export interface DangerouslyFindAllOptions<Entity extends SimpleEntity>
  extends FindOptionsBase<Entity> {
  where?: Where<Entity>;
}

export interface FindOptions<Entity extends SimpleEntity>
  extends FindOptionsBase<Entity> {
  where?: Where<Entity>;
  skip: number;
}

export interface CountOptions<Entity extends SimpleEntity>
  extends FindOptionsBase<Entity> {
  where?: Where<Entity>;
}

export type IncrementalUpdateChanges<Entity extends SimpleEntity> =
  QueryDeepPartialEntity<Entity>;

const FIND_LIMIT = 50;

export abstract class SimpleEntityRepository<
  Entity extends SimpleEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends AbstractRepository<Entity> {
  _EntityCreationAttributes!: Omit<
    Entity,
    keyof SimpleEntity | FieldsOmittedBeforePersistence | 'toJSON'
  >;

  findOne(
    query: FindOneOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<Entity | undefined> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    return repository.findOne(query);
  }

  async find(
    query: FindOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ) {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const limit = FIND_LIMIT;
    const results = await repository.findAndCount({
      ...query,
      take: limit,
    });

    return {
      limit,
      rows: results[0],
      total: results[1],
    };
  }

  /**
   * This method will return all existing entities that match the query
   * It may become a performance bottleneck
   */
  async dangerouslyFindAll(
    query: DangerouslyFindAllOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ) {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    return repository.find(query);
  }

  async count(
    query: CountOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<number> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const results = await repository.count(query);

    return results;
  }

  async create(
    entityLikeObject: this['_EntityCreationAttributes'],
    auditContext: AuditContext,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<Entity> {
    const result = await this.createMany(
      [entityLikeObject],
      auditContext,
      options,
    );

    return result[0] || throwError();
  }

  async createMany(
    entityLikeObjects: Array<this['_EntityCreationAttributes']>,
    auditContext: AuditContext,
    options?: Partial<{
      manager: EntityManager;
      _allowMutationsToEntityLikeObjects: boolean;
    }>,
  ): Promise<Entity[]> {
    const EntityClass = this.repository.target as ConcreteClass<
      Partial<Entity>
    >;

    const repository = options?.manager
      ? options.manager.getRepository<Entity>(EntityClass)
      : this.repository;

    const toSave: DeepPartial<Entity>[] = [];

    for (const entityLikeObject of entityLikeObjects) {
      const _entityLikeObject = (
        options?._allowMutationsToEntityLikeObjects
          ? entityLikeObject
          : {
              ...entityLikeObject,
            }
      ) as Partial<Entity>;

      _entityLikeObject.id = undefined;

      if (this.repository.metadata.createDateColumn) {
        _entityLikeObject[
          this.repository.metadata.createDateColumn.propertyName as keyof Entity
        ] = undefined;
      }

      const entity = new EntityClass();

      for (const _k of Object.keys(_entityLikeObject)) {
        const key = _k as keyof Partial<Entity>;
        const value = _entityLikeObject[key];

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (value === undefined) {
          continue;
        }

        entity[key] = value;
      }

      toSave.push(entity as DeepPartial<Entity>);
    }

    await repository.save(toSave);

    return toSave as unknown as Entity[];
  }

  async save(
    entity: Entity,
    auditContext: AuditContext,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<void> {
    return this.saveMany([entity], auditContext, options);
  }

  async saveMany(
    entities: Entity[],
    auditContext: AuditContext,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<void> {
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    const repository = options?.manager
      ? options.manager.getRepository<Entity>(EntityClass)
      : this.repository;

    await repository.save(entities as unknown as DeepPartial<Entity>[]);
  }

  async selectManyAndCount(
    options: {
      alias: string;
      withDeleted?: boolean;
      skip: number;
    },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Entity>,
    ) => SelectQueryBuilder<Entity>,
  ) {
    const limit = FIND_LIMIT;

    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    if (options.withDeleted) {
      queryBuilder = queryBuilder.withDeleted();
    }

    queryBuilder = builderFn(queryBuilder).skip(options.skip).take(limit);

    const results = await queryBuilder.getManyAndCount();

    return {
      limit,
      rows: results[0],
      total: results[1],
    };
  }

  async selectOne(
    options: {
      alias: string;
      withDeleted?: boolean;
    },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Entity>,
    ) => SelectQueryBuilder<Entity>,
  ) {
    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    if (options.withDeleted) {
      queryBuilder = queryBuilder.withDeleted();
    }

    queryBuilder = builderFn(queryBuilder);

    return queryBuilder.getOne();
  }

  /**
   * This method will return all existing entities that match the query
   * It may become a performance bottleneck
   */
  async dangerouslySelectMany(
    options: {
      alias: string;
      withDeleted?: boolean;
    },
    builderFn: (
      queryBuilder: SelectQueryBuilder<Entity>,
    ) => SelectQueryBuilder<Entity>,
  ) {
    let queryBuilder = this.repository.createQueryBuilder(options.alias);

    if (options.withDeleted) {
      queryBuilder = queryBuilder.withDeleted();
    }

    queryBuilder = builderFn(queryBuilder);

    return queryBuilder.getMany();
  }

  async incrementalUpdate(
    entity: Entity,
    values: IncrementalUpdateChanges<Entity>,
    auditContext: AuditContext,
    options?: { manager?: EntityManager },
  ): Promise<void> {
    return this.incrementalUpdateForMany(
      [entity],
      values,
      auditContext,
      options,
    );
  }

  async incrementalUpdateForMany(
    entities: Entity[],
    values: IncrementalUpdateChanges<Entity>,
    auditContext: AuditContext,
    options?: { manager?: EntityManager },
  ): Promise<void> {
    const EntityClass = this.repository.target as Class;

    for (const entity of entities) {
      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    const repository = options?.manager
      ? options.manager.getRepository<Entity>(EntityClass)
      : this.repository;

    await repository
      .createQueryBuilder()
      .update(EntityClass)
      .set(values)
      .whereEntity(entities)
      .returning('*')
      .execute();
  }
}
