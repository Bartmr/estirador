import { Column, Connection, Entity, EntityRepository } from 'typeorm';
import { AuditedEntity } from './audited.entity';
import { getDatabaseConnection } from '../../databases/spec/databases-test-utils';
import { AuditedEntityRepository } from './audited-entity.repository';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { stripNullValuesRecursively } from 'src/internals/utils/strip-null-values-recursively';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';

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
}

@EntityRepository(TestEntity)
class TestsRepository extends AuditedEntityRepository<TestEntity> {}

beforeAll(async () => {
  connection = await getDatabaseConnection([TestEntity]);

  await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
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
      const repository = connection.getRepository(TestEntity);

      const unpersistedEntity = new TestEntity();

      unpersistedEntity.createdAt = newDate;
      unpersistedEntity.updatedAt = newDate;

      const entity = await connection.manager.save(unpersistedEntity);

      entity.propA = newDate;

      const customRepository =
        connection.manager.getCustomRepository(TestsRepository);

      const auditContext: AuditContext = {
        operationId: generateRandomUUID(),
        processId: 'test',
        requestPath: undefined,
        requestMethod: undefined,
        authContext: undefined,
      };

      await customRepository.save(auditContext, entity);

      const rows = await repository.find({
        withDeleted: true,
        where: { instanceId: entity.instanceId },
      });

      expect(rows.length).toEqual(2);

      const entityWithoutNulls = stripNullValuesRecursively(
        entity,
      ) as TestEntity;

      expect(stripNullValuesRecursively(rows)).toEqual([
        {
          ...entityWithoutNulls,
          deletedAt: undefined,
          id: expect.any(String) as unknown,
        },
        {
          ...entityWithoutNulls,
          deletedAt: expect.any(Date) as unknown,
          id: expect.any(String) as unknown,
          ...auditContext,
          processId: undefined,
          requestPath: undefined,
          requestMethod: undefined,
        },
      ]);
    });
  });

  describe('Create', () => {
    it('Should have created an archived version of the entity after creating it', async () => {
      const newDate = new Date();
      const repository = connection.getCustomRepository(TestsRepository);

      const auditContext: AuditContext = {
        operationId: generateRandomUUID(),
        processId: 'test',
        requestPath: undefined,
        requestMethod: undefined,
        authContext: undefined,
      };

      const entity = await repository.create(auditContext, {
        propA: newDate,
        propB: newDate,
      });

      const results = await repository.find({
        withDeleted: true,
        where: { instanceId: entity.instanceId },
        skip: 0,
      });

      expect(results.rows.length).toEqual(2);

      const entityWithoutNulls = stripNullValuesRecursively(
        entity,
      ) as TestEntity;

      expect(stripNullValuesRecursively(results.rows)).toEqual([
        {
          ...entityWithoutNulls,
          deletedAt: undefined,
          id: expect.any(String) as unknown,
          processId: undefined,
          requestPath: undefined,
          requestMethod: undefined,
        },
        {
          ...entityWithoutNulls,
          deletedAt: expect.any(Date) as unknown,
          id: expect.any(String) as unknown,
          ...auditContext,
          processId: undefined,
          requestPath: undefined,
          requestMethod: undefined,
        },
      ]);
    });
  });
});
