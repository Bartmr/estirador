import { createTestAuditContext } from 'src/internals/auditing/spec/create-test-audit-context';
import { Column, Connection, Entity, EntityRepository } from 'typeorm-bartmr';
import { getTestDatabaseConnection } from '../spec/databases-test-utils';
import { SimpleEntityRepository } from './simple-entity.repository';
import { SimpleEntity } from './simple.entity';

@Entity('simple_entity_repository_e2e_spec_entity_a')
class EntityA extends SimpleEntity {
  @Column()
  counter!: number;
}

@EntityRepository(EntityA)
class EntityARepository extends SimpleEntityRepository<EntityA> {}

let connection: Connection;

beforeAll(async () => {
  connection = await getTestDatabaseConnection([EntityA]);

  await connection.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  await connection.synchronize();
});

afterAll(() => connection.close());

describe('Simple Entity Repository', () => {
  it('Should mutate an entity instance when doing an incremental update', async () => {
    const { auditContext } = createTestAuditContext();

    const entityARepository = connection.getCustomRepository(EntityARepository);

    const entityA = await entityARepository.create(
      { counter: 3 },
      auditContext,
    );

    await entityARepository.incrementalUpdate(
      entityA,
      { counter: () => 'counter + 2' },
      auditContext,
    );

    expect(entityA.counter).toBe(5);
  });
});
