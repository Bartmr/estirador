import { OmitWithUndefined } from '@app/shared/internals/utils/types/omission-types';
import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  AbstractRepository,
  EntityManager,
  FindOperator,
  Repository,
} from 'typeorm';
import { AuditedEntity } from './audited.entity';

type SimpleEntity = {
  id: number | string;
};

type WhereObject<Entity extends AuditedEntity> = {
  [K in keyof Entity]?:
    | (Entity[K] extends SimpleEntity ? Entity[K] | Entity[K]['id'] : never)
    | Entity[K]
    | FindOperator<Entity[K]>;
};

export type Where<Entity extends AuditedEntity> =
  | WhereObject<Entity>
  | Array<WhereObject<Entity>>;

type FindOptionsBase<Entity extends AuditedEntity> = {
  withArchived?: boolean;
  select?: Array<keyof Entity>;
};

export interface FindOneOptions<Entity extends AuditedEntity>
  extends FindOptionsBase<Entity> {
  where: Where<Entity>;
}

export interface FindOptions<Entity extends AuditedEntity>
  extends FindOptionsBase<Entity> {
  where?: Where<Entity>;
  skip: number;
}

export abstract class AuditedEntityRepository<
  Entity extends AuditedEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never
> extends AbstractRepository<Entity> {
  _AuditedEntityCreationAttributes!: OmitWithUndefined<
    Entity,
    keyof AuditedEntity | FieldsOmittedBeforePersistence
  >;

  findOne({
    where,
    withArchived,
    select,
  }: FindOneOptions<Entity>): Promise<Entity | undefined> {
    return this.repository.findOne({
      where,
      withDeleted: withArchived,
      select,
    });
  }

  async find({ where, withArchived, select, skip }: FindOptions<Entity>) {
    const limit = 20;
    const results = await this.repository.findAndCount({
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

  private assignArchiveAttributesToEntity(
    auditContext: AuditContext,
    entity: Entity,
  ) {
    Object.assign(entity, {
      ...auditContext,
      archivedAt: new Date(),
      archivedByUserId: auditContext.authContext?.user.id,
    });
  }

  private async archiveChange(
    repository: Repository<AuditedEntity>,
    auditContext: AuditContext,
    updatedEntity: Entity,
  ): Promise<void> {
    const entityDataClone = {
      ...updatedEntity,
      id: undefined,
    };

    this.assignArchiveAttributesToEntity(auditContext, entityDataClone);

    await repository.save(repository.create(entityDataClone));
  }

  async create(
    auditContext: AuditContext,
    entityLikeObject: OmitWithUndefined<
      Entity,
      keyof AuditedEntity | FieldsOmittedBeforePersistence
    >,
  ): Promise<Entity> {
    const run = async (manager: EntityManager) => {
      const repository = manager.getRepository<AuditedEntity>(
        this.repository.target,
      );

      const _entityLikeObject = entityLikeObject as Entity;

      const createdAt = new Date();
      _entityLikeObject.createdAt = createdAt;
      _entityLikeObject.updatedAt = createdAt;

      const createdEntity = await repository.save(_entityLikeObject);

      await this.archiveChange(repository, auditContext, createdEntity);

      return createdEntity;
    };

    if (
      this.manager.queryRunner &&
      this.manager.queryRunner.isTransactionActive
    ) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async update(auditContext: AuditContext, entity: Entity): Promise<Entity> {
    const run = async (manager: EntityManager) => {
      const repository = manager.getRepository<AuditedEntity>(
        this.repository.target,
      );

      entity.updatedAt = new Date();

      const updatedEntity = await repository.save(entity);

      await this.archiveChange(repository, auditContext, updatedEntity);

      return updatedEntity;
    };

    if (
      this.manager.queryRunner &&
      this.manager.queryRunner.isTransactionActive
    ) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async delete(auditContext: AuditContext, entity: Entity): Promise<void> {
    const run = async (manager: EntityManager) => {
      const repository = manager.getRepository(this.repository.target);

      this.assignArchiveAttributesToEntity(auditContext, entity);

      await repository.save(entity);
    };

    if (
      this.manager.queryRunner &&
      this.manager.queryRunner.isTransactionActive
    ) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
