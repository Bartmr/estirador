import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { DeepPartial, EntityManager } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { generateUniqueUUID } from '../../utils/generate-unique-uuid';
import { ConcreteClass } from '@app/shared/internals/utils/types/classes-types';

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
    Object.assign(entity, {
      ...auditContext,
      deletedAt: new Date(),
      archivedByUserId: auditContext.authContext?.user.id,
    });
  }

  private async archiveChange(
    updatedEntity: Entity,
    auditContext: AuditContext,
    manager: EntityManager,
  ): Promise<void> {
    const entityDataClone = {
      ...updatedEntity,
    };

    this.assignArchiveAttributesToEntity(entityDataClone, auditContext);

    await super.create(entityDataClone, auditContext, { manager });
  }

  async create(
    entityLikeObject: this['_EntityCreationAttributes'],
    auditContext: AuditContext,
  ): Promise<Entity> {
    const run = async (manager: EntityManager) => {
      const repository = manager.getRepository<Entity>(this.repository.target);

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
      await repository.save(_createdEntity as DeepPartial<Entity>);

      const createdEntity = _createdEntity as Entity;
      await this.archiveChange(createdEntity, auditContext, manager);
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

  async save(entity: Entity, auditContext: AuditContext): Promise<void> {
    const run = async (manager: EntityManager) => {
      entity.updatedAt = new Date();

      await super.save(entity, auditContext, { manager });

      await this.archiveChange(entity, auditContext, manager);
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

  async remove(entity: Entity, auditContext: AuditContext): Promise<void> {
    const run = async (manager: EntityManager) => {
      this.assignArchiveAttributesToEntity(entity, auditContext);

      await super.save(entity, auditContext, { manager });
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
