import { Column, Connection, Entity, EntityRepository } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { getDatabaseConnection } from '../../databases/spec/databases-test-utils';
import { AuditedEntityRepository } from './audited-entity.repository';
import { createAuditContextTestMock } from '../spec/create-test-audit-context';

const TEST_TABLE_NAME = 'audited_entity_spec';

let connection: Connection;

class TestEntityBase extends AuditedEntity {
  @Column({ default: () => 'now()' })
  propA!: Date;
}

@Entity(TEST_TABLE_NAME)
class TestEntity extends TestEntityBase {
  @Column({ default: () => 'now()' })
  propB!: Date;

  @Column({ nullable: true })
  propC?: number;
}

@EntityRepository(TestEntity)
class TestEntityRepository extends AuditedEntityRepository<TestEntity> {}

beforeAll(async () => {
  connection = await getDatabaseConnection([TestEntity]);

  await connection.query(`DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`);
  await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await connection.synchronize();
});

afterAll(async () => {
  await connection.close();
});

describe('Audited Entity Repository', () => {
  describe('Create', () => {
    it('Should have created an archived version of the entity after creating it', async () => {
      const newDate = new Date();
      const repository = connection.getCustomRepository(TestEntityRepository);

      const auditContextMock = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: newDate,
          propB: newDate,
        },
        auditContextMock.auditContext,
      );

      const results = await repository.find({
        withDeleted: true,
        where: { instanceId: entity.instanceId },
        skip: 0,
      });

      expect(results.rows.map((c) => c.toJSON())).toEqual([
        {
          ...entity,
          ...auditContextMock.persisted.auditContextEntityProps,
        },
        {
          ...entity,
          ...auditContextMock.persisted.auditContextArchivedEntityProps,
        },
      ]);
    });
  });

  describe('incrementalUpdate', () => {
    it('Should increment the update and created an archived version of the entity after', async () => {
      const newDate = new Date();
      const repository = connection.getCustomRepository(TestEntityRepository);

      const auditContextMock = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: newDate,
          propB: newDate,
          propC: 1,
        },
        auditContextMock.auditContext,
      );

      const entityBeforeUpdate = {
        ...entity,
      };

      await repository.incrementalUpdate(
        entity,
        {
          propC: () => `"propC" + 1`,
        },
        auditContextMock.auditContext,
      );

      const results = await repository.find({
        withDeleted: true,
        where: { instanceId: entity.instanceId },
        skip: 0,
      });

      // Updated entity should be mutated
      expect(entity.propC).toBe(2);

      expect(results.rows.map((c) => c.toJSON())).toEqual([
        {
          ...entityBeforeUpdate,
          ...auditContextMock.persisted.auditContextArchivedEntityProps,
          updatedAt: expect.any(Date) as unknown,
        },

        {
          ...entityBeforeUpdate,
          propC: 2,
          ...auditContextMock.persisted.auditContextEntityProps,
          updatedAt: expect.any(Date) as unknown,
        },
        {
          ...entityBeforeUpdate,
          propC: 2,
          ...auditContextMock.persisted.auditContextArchivedEntityProps,
          updatedAt: expect.any(Date) as unknown,
        },
      ]);
    });

    it('Should change updatedAt when updating', async () => {
      const repository = connection.getCustomRepository(TestEntityRepository);
      const auditContextMock = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: new Date(),
          propB: new Date(),
          propC: 1,
        },
        auditContextMock.auditContext,
      );

      const oldDate = entity.updatedAt;

      await repository.incrementalUpdate(
        entity,
        {
          propA: new Date(),
        },
        auditContextMock.auditContext,
      );

      expect(JSON.stringify(oldDate)).not.toBe(
        JSON.stringify(entity.updatedAt),
      );
    });

    it('Should persist archived entity attributes to active row when removing', async () => {
      const repository = connection.getCustomRepository(TestEntityRepository);

      const auditContextMock1 = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: new Date(),
          propB: new Date(),
          propC: 1,
        },
        auditContextMock1.auditContext,
      );

      const auditContextMock2 = createAuditContextTestMock();

      await repository.remove(entity, auditContextMock2.auditContext);

      const results = await repository.find({
        where: { instanceId: entity.instanceId },
        withDeleted: true,
        skip: 0,
      });

      expect(results.rows.map((c) => c.toJSON())).toEqual([
        {
          ...entity,
          ...auditContextMock1.persisted.auditContextArchivedEntityProps,
        },

        {
          ...entity,
          ...auditContextMock2.persisted.auditContextArchivedEntityProps,
        },
      ]);
    });
  });
});
