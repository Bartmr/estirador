import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { DeepPartial, EntityManager } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { generateUniqueUUID } from '../../utils/generate-unique-uuid';
import { ConcreteClass } from '@app/shared/internals/utils/types/classes-types';
import { throwError } from 'src/internals/utils/throw-error';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class AuditedEntityRepository<
  Entity extends AuditedEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends SimpleEntityRepository<
  Entity,
  keyof AuditedEntity | FieldsOmittedBeforePersistence
> {
  private assignArchiveAttributesToEntity(
    entity: Entity,
    auditContext: AuditContext,
  ) {
    entity.operationId = auditContext.operationId;
    entity.requestPath = auditContext.requestPath;
    entity.requestMethod = auditContext.requestMethod;
    entity.processId = auditContext.processId;

    entity.deletedAt = new Date();
    entity.archivedByUserId = auditContext.authContext?.user.id;
  }

  private async archiveChanges(
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

    await super.createMany(toArchive, auditContext, { manager });
  }

  async create(
    entityLikeObject: this['_EntityCreationAttributes'],
    auditContext: AuditContext,
  ): Promise<Entity> {
    const result = await this.createMany([entityLikeObject], auditContext);

    return result[0] || throwError();
  }

  async createMany(
    entityLikeObjects: Array<this['_EntityCreationAttributes']>,
    auditContext: AuditContext,
  ): Promise<Entity[]> {
    const run = async (manager: EntityManager) => {
      const repository = manager.getRepository<Entity>(this.repository.target);

      const toSave: DeepPartial<Entity>[] = [];

      for (const entityLikeObject of entityLikeObjects) {
        const _entityLikeObject = {
          ...entityLikeObject,
        } as Partial<Entity>;

        const id = generateUniqueUUID();
        _entityLikeObject.id = id;

        /*
          instanceId will always be unique
          because it reuses the id that will be used as primary key
        */
        _entityLikeObject.instanceId = id;

        delete _entityLikeObject.deletedAt;
        delete _entityLikeObject.operationId;
        delete _entityLikeObject.requestPath;
        delete _entityLikeObject.requestMethod;
        delete _entityLikeObject.processId;
        delete _entityLikeObject.archivedByUserId;

        const createdAt = new Date();
        _entityLikeObject.createdAt = createdAt;
        _entityLikeObject.updatedAt = createdAt;

        const EntityClass = this.repository.target as ConcreteClass<
          Partial<Entity>
        >;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _createdEntity = new EntityClass();
        for (const _k of Object.keys(_entityLikeObject)) {
          const key = _k as keyof Partial<Entity>;

          _createdEntity[key] = _entityLikeObject[key];
        }

        toSave.push(_createdEntity as DeepPartial<Entity>);
      }

      await repository.save(toSave);

      const createdEntities = toSave as Entity[];

      await this.archiveChanges(createdEntities, auditContext, manager);

      return createdEntities;
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async save(entity: Entity, auditContext: AuditContext): Promise<void> {
    return this.saveMany([entity], auditContext);
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

  async remove(entity: Entity, auditContext: AuditContext): Promise<void> {
    return this.removeMany([entity], auditContext);
  }

  async removeMany(
    entities: Entity[],
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      for (const entity of entities) {
        this.assignArchiveAttributesToEntity(entity, auditContext);
      }

      await super.saveMany(entities, auditContext, { manager });
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }

  async incrementalUpdate(
    entity: Entity,
    values: QueryDeepPartialEntity<Entity>,
    auditContext: AuditContext,
  ): Promise<void> {
    const run = async (manager: EntityManager) => {
      await super.incrementalUpdate(entity, values, auditContext, { manager });

      await this.archiveChanges([entity], auditContext, manager);
    };

    if (this.manager.queryRunner?.isTransactionActive) {
      return run(this.manager);
    } else {
      return this.manager.transaction(run);
    }
  }
}
