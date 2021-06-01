import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityManager } from 'typeorm';
import { AuditedEntity } from './audited.entity';

export abstract class AuditedEntityRepository<
  Entity extends AuditedEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends SimpleEntityRepository<
  Entity,
  keyof AuditedEntity | FieldsOmittedBeforePersistence
> {
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
    auditContext: AuditContext,
    updatedEntity: Entity,
    manager: EntityManager,
  ): Promise<void> {
    const entityDataClone = {
      ...updatedEntity,
      id: undefined,
    };

    this.assignArchiveAttributesToEntity(auditContext, entityDataClone);

    await super.create(auditContext, entityDataClone, manager);
  }

  async create(
    auditContext: AuditContext,
    entityLikeObject: this['_EntityCreationAttributes'],
  ): Promise<Entity> {
    const run = async (manager: EntityManager) => {
      const _entityLikeObject = entityLikeObject as Partial<Entity>;

      delete _entityLikeObject.archivedAt;
      delete _entityLikeObject.instanceId;
      delete _entityLikeObject.operationId;
      delete _entityLikeObject.requestPath;
      delete _entityLikeObject.requestMethod;
      delete _entityLikeObject.processId;
      delete _entityLikeObject.archivedByUserId;

      const createdAt = new Date();
      _entityLikeObject.createdAt = createdAt;
      _entityLikeObject.updatedAt = createdAt;

      const createdEntity = await super.create(
        auditContext,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _entityLikeObject as any,
        manager,
      );

      await this.archiveChange(auditContext, createdEntity, manager);

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
      entity.updatedAt = new Date();

      const updatedEntity = await super.update(auditContext, entity, manager);

      await this.archiveChange(auditContext, updatedEntity, manager);

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
      this.assignArchiveAttributesToEntity(auditContext, entity);

      await super.update(auditContext, entity, manager);
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
