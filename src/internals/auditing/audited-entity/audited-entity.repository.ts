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
  ) {
    entity.operationId = auditContext.operationId;
    entity.requestPath = auditContext.requestPath;
    entity.requestMethod = auditContext.requestMethod;
    entity.processId = auditContext.processId;
    entity.archivedByUserId = auditContext.authContext?.user.id || null;
    entity.deletedAt = new Date();
  }

  protected async archiveChanges(
    updatedEntities: Entity[],
    auditContext: AuditContext,
    manager: EntityManager,
  ): Promise<void> {
    const toArchive: this['_EntityCreationAttributes'][] = [];

    for (const updatedEntity of updatedEntities) {
      const entityDataClone = {
        ...updatedEntity,
      };

      this.assignArchiveAttributesToEntity(entityDataClone, auditContext);

      toArchive.push(entityDataClone);
    }

    await super.createMany(toArchive, auditContext, {
      manager,
      _allowMutationsToEntityLikeObjects: true,
    });
  }

  async createMany(
    entityLikeObjects: Array<this['_EntityCreationAttributes']>,
    auditContext: AuditContext,
  ): Promise<Entity[]> {
    const run = async (manager: EntityManager) => {
      const EntityClass = this.repository.target as ConcreteClass<
        Partial<Entity>
      >;

      const repository = manager.getRepository<Entity>(EntityClass);

      const toSave: DeepPartial<Entity>[] = [];

      for (const entityLikeObject of entityLikeObjects) {
        const _entityLikeObject = {
          ...entityLikeObject,
        } as Partial<Entity>;

        _entityLikeObject.id = undefined;
        _entityLikeObject.instanceId = undefined;
        _entityLikeObject.deletedAt = undefined;
        _entityLikeObject.operationId = undefined;
        _entityLikeObject.requestPath = undefined;
        _entityLikeObject.requestMethod = undefined;
        _entityLikeObject.processId = undefined;
        _entityLikeObject.archivedByUserId = undefined;

        const createdAt = new Date();
        _entityLikeObject.createdAt = createdAt;
        _entityLikeObject.updatedAt = createdAt;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _createdEntity = new EntityClass();
        for (const _k of Object.keys(_entityLikeObject)) {
          const key = _k as keyof Partial<Entity>;
          const value = _entityLikeObject[key];

          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          if (value === undefined) {
            continue;
          }

          _createdEntity[key] = value;
        }

        toSave.push(_createdEntity as DeepPartial<Entity>);
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
}
