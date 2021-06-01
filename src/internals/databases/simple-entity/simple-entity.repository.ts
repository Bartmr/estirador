import { ClassType } from '@app/shared/internals/utils/types/classes-types';
import { OmitWithTypesafeKeys } from '@app/shared/internals/utils/types/omission-types';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  AbstractRepository,
  DeepPartial,
  EntityManager,
  FindOperator,
} from 'typeorm';
import { SimpleEntity } from './simple.entity';

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

type FindOptionsBase<Entity extends SimpleEntity> = {
  withArchived?: boolean;
  select?: Array<keyof Entity>;
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

export abstract class SimpleEntityRepository<
  Entity extends SimpleEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends AbstractRepository<Entity> {
  _EntityCreationAttributes!: OmitWithTypesafeKeys<
    Entity,
    keyof SimpleEntity | FieldsOmittedBeforePersistence
  >;

  findOne(
    { where, withArchived, select }: FindOneOptions<Entity>,
    manager?: EntityManager,
  ): Promise<Entity | undefined> {
    const repository = manager
      ? manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    return repository.findOne({
      where,
      withDeleted: withArchived,
      select,
    });
  }

  async find(
    { where, withArchived, select, skip }: FindOptions<Entity>,
    manager?: EntityManager,
  ) {
    const repository = manager
      ? manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const limit = 20;
    const results = await repository.findAndCount({
      where,
      withDeleted: withArchived,
      select,
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
    auditContext: AuditContext,
    entityLikeObject: this['_EntityCreationAttributes'],
    options?: Partial<{ id: Entity['id'] }>,
    manager?: EntityManager,
  ): Promise<Entity> {
    const repository = manager
      ? manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    const _entityLikeObject = entityLikeObject as Partial<Entity>;

    delete _entityLikeObject.id;

    const entity = repository.create(
      _entityLikeObject as unknown as DeepPartial<Entity>,
    );

    if (options?.id !== undefined) {
      const preexisting = await repository.findOne(options.id);

      if (preexisting) {
        throw new Error();
      }

      _entityLikeObject.id = options.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await repository.save(entity as any);

    return entity;
  }

  async save(
    auditContext: AuditContext,
    entity: Entity,
    manager?: EntityManager,
  ): Promise<void> {
    const EntityClass = this.repository.target as ClassType;

    if (!(entity instanceof EntityClass)) {
      throw new Error();
    }

    const repository = manager
      ? manager.getRepository<Entity>(this.repository.target)
      : this.repository;

    await repository.save(entity as unknown as DeepPartial<Entity>);
  }

  async remove(
    auditContext: AuditContext,
    entity: Entity,
    manager?: EntityManager,
  ): Promise<void> {
    const EntityClass = this.repository.target as ClassType;

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
