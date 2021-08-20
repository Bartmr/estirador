import {
  Class,
  ConcreteClass,
} from '@app/shared/internals/utils/types/classes-types';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  AbstractRepository,
  DeepPartial,
  EntityManager,
  FindOperator,
  SelectQueryBuilder,
} from 'typeorm';
import { SimpleEntity } from './simple.entity';
import { generateUniqueUUID } from '../../utils/generate-unique-uuid';
import { throwError } from 'src/internals/utils/throw-error';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

type AnyEntity = {
  id: number | string;
};

type WhereObject<Entity extends SimpleEntity> = {
  [K in keyof Entity]?: Entity[K] extends AnyEntity | AnyEntity[]
    ? undefined
    : Entity[K] extends Promise<AnyEntity> | Promise<AnyEntity[]>
    ? undefined
    : Entity[K] | FindOperator<Entity[K]>;
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

export interface FindOptions<Entity extends SimpleEntity>
  extends FindOptionsBase<Entity> {
  where?: Where<Entity>;
  skip: number;
}

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

  async create(
    entityLikeObject: this['_EntityCreationAttributes'],
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
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
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<Entity[]> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const toSave: DeepPartial<Entity>[] = [];

    for (const entityLikeObject of entityLikeObjects) {
      const _entityLikeObject = {
        ...entityLikeObject,
      } as Partial<Entity>;

      _entityLikeObject.id = generateUniqueUUID();

      const EntityClass = this.repository.target as ConcreteClass<
        Partial<Entity>
      >;

      const entity = new EntityClass();

      for (const _k of Object.keys(_entityLikeObject)) {
        const key = _k as keyof Partial<Entity>;

        entity[key] = _entityLikeObject[key];
      }

      toSave.push(entity as DeepPartial<Entity>);
    }

    await repository.save(toSave);

    return toSave as unknown as Entity[];
  }

  async save(
    entity: Entity,
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<void> {
    return this.saveMany([entity], auditContext, options);
  }

  async saveMany(
    entities: Entity[],
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<void> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    for (const entity of entities) {
      const EntityClass = this.repository.target as Class;

      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    await repository.save(entities as unknown as DeepPartial<Entity>[]);
  }

  async remove(
    entity: Entity,
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<void> {
    return this.removeMany([entity], auditContext, options);
  }

  async removeMany(
    entities: Entity[],
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<void> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    for (const entity of entities) {
      const EntityClass = this.repository.target as Class;

      if (!(entity instanceof EntityClass)) {
        throw new Error();
      }
    }

    if (this.repository.metadata.deleteDateColumn) {
      await repository.softRemove(entities as unknown as DeepPartial<Entity>[]);
    } else {
      await repository.remove(entities);
    }
  }

  async getManyAndCount(
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

  async incrementalUpdateById(
    id: Entity['id'],
    values: QueryDeepPartialEntity<Entity>,
    auditContext: AuditContext,
    options?: { manager?: EntityManager },
  ): Promise<undefined | { [key: string]: unknown }> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const result = await repository
      .createQueryBuilder()
      .update(this.repository.target)
      .whereInIds([id])
      .set(values)
      .returning('*')
      .execute();

    const rawResults = result.raw as Array<{ [key: string]: unknown }>;

    const changedEntity = rawResults[0];

    return changedEntity;
  }
}
