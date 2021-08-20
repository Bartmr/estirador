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
class TestsRepository extends AuditedEntityRepository<TestEntity> {}

beforeAll(async () => {
  connection = await getDatabaseConnection([TestEntity]);

  await connection.query(`DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`);
  await connection.synchronize();
});

afterAll(async () => {
  await connection.close();
});

describe('Audited Entity Repository', () => {
  describe('Update', () => {
    it('Should have created an archived version of the entity after an update', async () => {
      const newDate = new Date();

      const repository = connection.getCustomRepository(TestsRepository);

      const auditContextMock = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: newDate,
          propB: newDate,
        },
        auditContextMock.auditContext,
      );

      const result = await repository.find({
        withDeleted: true,
        where: { instanceId: entity.instanceId },
        skip: 0,
      });

      expect(result.total).toEqual(2);

      expect(result.rows.map((c) => c.toJSON())).toEqual([
        {
          ...entity,
          ...auditContextMock.persisted.auditContextEntityProps,
        },
        {
          ...entity,
          ...auditContextMock.persisted.auditContextArchivedEntityProps,
          id: expect.any(String) as unknown,
          deletedAt: expect.any(Date) as unknown,
        },
      ]);
    });
  });

  describe('Create', () => {
    it('Should have created an archived version of the entity after creating it', async () => {
      const newDate = new Date();
      const repository = connection.getCustomRepository(TestsRepository);

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

      expect(results.rows.length).toEqual(2);

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

  describe('Incremental updates', () => {
    it('Should increment the update and created an archived version of the entity after', async () => {
      const newDate = new Date();
      const repository = connection.getCustomRepository(TestsRepository);

      const auditContextMock = createAuditContextTestMock();

      const entity = await repository.create(
        {
          propA: newDate,
          propB: newDate,
          propC: 1,
        },
        auditContextMock.auditContext,
      );

      await repository.incrementalUpdateById(
        entity.id,
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

      expect(results.rows.length).toEqual(2);

      expect(results.rows.map((c) => c.toJSON())).toEqual([
        {
          ...entity,
          ...auditContextMock.persisted.auditContextArchivedEntityProps,
        },
        {
          ...entity,
          propC: 2,
          ...auditContextMock.persisted.auditContextEntityProps,
        },
      ]);
    });
  });
});
