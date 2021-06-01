import { AuditContext } from 'src/internals/auditing/audit-context';
import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityManager, Repository } from 'typeorm';
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
    entityLikeObject: this['_EntityCreationAttributes'],
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
