import { AuditContext } from 'src/internals/auditing/audit-context';
import {
  IncrementalUpdateChanges,
  SimpleEntityRepository,
} from 'src/internals/databases/simple-entity/simple-entity.repository';
import { DeepPartial, EntityManager } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { ConcreteClass } from 'libs/shared/src/internals/utils/types/classes-types';

export abstract class AuditedEntityRepository<
  Entity extends AuditedEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends SimpleEntityRepository<
  Entity,
  keyof AuditedEntity | FieldsOmittedBeforePersistence
> {
  protected assignArchiveAttributesToEntity(
    entity: Entity,
    auditContext: AuditContext,
    options?: { alreadyRemoved?: boolean },
  ) {
    entity.operationId = auditContext.operationId;
    entity.requestPath = auditContext.requestPath;
    entity.requestMethod = auditContext.requestMethod;
    entity.processId = auditContext.processId;

    if (!options?.alreadyRemoved) {
      entity.deletedAt = new Date();
    }
  }

  protected async archiveChanges(
    updatedEntities: Entity[],
    auditContext: AuditContext,
    manager: EntityManager,
    options?: { alreadyRemoved?: boolean },
  ): Promise<void> {
    const toArchive: this['_EntityCreationAttributes'][] = [];

    for (const updatedEntity of updatedEntities) {
      const entityDataClone = {
        ...updatedEntity,
      };

      this.assignArchiveAttributesToEntity(entityDataClone, auditContext, {
        alreadyRemoved: options?.alreadyRemoved,
      });

      toArchive.push(entityDataClone);
    }

    await super.createMany(toArchive, auditContext, {
      manager,
      keepCreatedAt: true,
      keepUpdatedAt: true,
      keepDeletedAt: true,
    });
  }

  async createMany(
    entityLikeObjects: Array<this['_EntityCreationAttributes']>,
    auditContext: AuditContext,
  ): Promise<Entity[]> {
    const run = async (manager: EntityManager) => {
      const EntityClass = this.repository.target as ConcreteClass<{
        [key: string]: unknown;
      }>;

      const repository = manager.getRepository<Entity>(EntityClass);

      const toSave: DeepPartial<Entity>[] = [];

      const keys_to_strip: Array<keyof AuditedEntity> = [
        'id',
        'instanceId',
        'deletedAt',
        'recoveredAt',
        'operationId',
        'requestPath',
        'requestMethod',
        'processId',
        'createdAt',
        'updatedAt',
      ];

      const createdAt = new Date();

      for (const entityLikeObject of entityLikeObjects) {
        const entity = new EntityClass();

        for (const key of Object.keys(entityLikeObject)) {
          if (keys_to_strip.includes(key as keyof AuditedEntity)) {
            continue;
          }

          const value = (entityLikeObject as { [key: string]: unknown })[key];

          if (value === undefined) {
            continue;
          }

          entity[key] = value;
        }

        entity['createdAt'] = createdAt;
        entity['updatedAt'] = createdAt;

        toSave.push(entity as DeepPartial<Entity>);
      }

      await repository.save(toSave);

      const createdEntities = toSave as unknown as Entity[];

      await this.archiveChanges(createdEntities, auditContext, manager);

      return createdEntities;
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async saveMany(
    entities: Entity[],
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      for (const entity of entities) {
        entity.updatedAt = new Date();
      }

      await super.saveMany(entities, auditContext, { manager });

      await this.archiveChanges(entities, auditContext, manager);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async incrementalUpdateForMany(
    entities: Entity[],
    values: IncrementalUpdateChanges<Entity>,
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      values.updatedAt = new Date() as any;

      await super.incrementalUpdateForMany(entities, values, auditContext, {
        manager,
      });

      await this.archiveChanges(entities, auditContext, manager);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  protected async remove(
    entity: Entity,
    auditContext: AuditContext,
  ): Promise<void> {
    return this.removeMany([entity], auditContext);
  }

  protected async removeMany(
    entities: Entity[],
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      const toRemove: Entity[] = [];

      for (const entity of entities) {
        if (!entity.deletedAt) {
          entity.deletedAt = new Date();
          entity.recoveredAt = null;

          toRemove.push(entity);
        }
      }

      await super.saveMany(toRemove, auditContext, { manager });
      await this.archiveChanges(toRemove, auditContext, manager, {
        alreadyRemoved: true,
      });
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  protected async recover(
    entity: Entity,
    auditContext: AuditContext,
  ): Promise<void> {
    return this.recoverMany([entity], auditContext);
  }

  protected async recoverMany(
    entities: Entity[],
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      const toRecover: Entity[] = [];

      for (const entity of entities) {
        if (entity.deletedAt) {
          entity.deletedAt = null;
          entity.recoveredAt = new Date();

          toRecover.push(entity);
        }
      }

      await super.saveMany(toRecover, auditContext, { manager });
      await this.archiveChanges(toRecover, auditContext, manager);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
