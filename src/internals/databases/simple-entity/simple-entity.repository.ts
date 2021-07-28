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
} from 'typeorm';
import { SimpleEntity } from './simple.entity';
import { generateSecureUniqueUUID } from '../../utils/generate-secure-unique-uuid';

type WhereObject<Entity extends SimpleEntity> = {
  [K in keyof Entity]?:
    | (Entity[K] extends {
        id: number | string;
      }
        ? Entity[K] | Entity[K]['id']
        : never)
    | Entity[K]
    | FindOperator<Entity[K]>;
};

export type Where<Entity extends SimpleEntity> =
  | WhereObject<Entity>
  | Array<WhereObject<Entity>>;

type FindOptionsBase = {
  withDeleted?: boolean;
};

export interface FindOneOptions<Entity extends SimpleEntity>
  extends FindOptionsBase {
  where: Where<Entity>;
}

export interface FindOptions<Entity extends SimpleEntity>
  extends FindOptionsBase {
  where?: Where<Entity>;
  skip: number;
}

export abstract class SimpleEntityRepository<
  Entity extends SimpleEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends AbstractRepository<Entity> {
  _EntityCreationAttributes!: Omit<
    Entity,
    keyof SimpleEntity | FieldsOmittedBeforePersistence | 'toJSON'
  >;

  findOne(
    { where, withDeleted }: FindOneOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<Entity | undefined> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    return repository.findOne({
      where,
      withDeleted,
    });
  }

  async find(
    { where, withDeleted, skip }: FindOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ) {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const limit = 20;
    const results = await repository.findAndCount({
      where,
      withDeleted,
      take: limit,
      skip,
    });

    return {
      limit,
      total: results[1],
      rows: results[0],
    };
  }

  async create(
    entityLikeObject: this['_EntityCreationAttributes'],
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<Entity> {
    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const _entityLikeObject = Object.assign({}, entityLikeObject) as {
      id?: unknown;
      [key: string]: unknown;
    };

    _entityLikeObject.id = generateSecureUniqueUUID();

    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
    const EntityClass = this.repository.target as ConcreteClass<{
      [key: string]: unknown;
    }>;

    const entity = new EntityClass() as any;

    for (const key of Object.keys(_entityLikeObject)) {
      entity[key] = _entityLikeObject[key];
    }

    await repository.save(entity);

    return entity;
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
  }

  async save(
    entity: Entity,
    auditContext: AuditContext,
    options?: Partial<{ manager?: EntityManager }>,
  ): Promise<void> {
    const EntityClass = this.repository.target as Class;

    if (!(entity instanceof EntityClass)) {
      throw new Error();
    }

    const repository = options?.manager
      ? options.manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    await repository.save(entity as unknown as DeepPartial<Entity>);
  }

  async remove(
    entity: Entity,
    auditContext: AuditContext,
    manager?: EntityManager,
  ): Promise<void> {
    const EntityClass = this.repository.target as Class;

    if (!(entity instanceof EntityClass)) {
      throw new Error();
    }

    const repository = manager
      ? manager.getRepository<Entity>(EntityClass)
      : this.repository;

    if (this.repository.metadata.deleteDateColumn) {
      await repository.softRemove(entity as unknown as DeepPartial<Entity>);
    } else {
      await repository.remove(entity);
    }
  }
}
