import { Column, Connection, Entity } from 'typeorm';
import { getDatabaseConnection } from '../../databases/spec/databases-test-utils';
import { SimpleEntity } from './simple.entity';
import { generateUniqueUUID } from 'src/internals/utils/generate-unique-uuid';

const TEST_TABLE_NAME = 'simple_entity_spec';

let connection: Connection;

@Entity(TEST_TABLE_NAME)
class TestEntity extends SimpleEntity {
  @Column('uuid')
  propA!: string;
}

beforeAll(async () => {
  connection = await getDatabaseConnection([TestEntity]);

  await connection.query(`DROP TABLE IF EXISTS ${TEST_TABLE_NAME}`);
  await connection.synchronize();
});

afterAll(async () => {
  await connection.close();
});

describe('Simple Entity Repository', () => {
  it('Entity should be mutated and not cloned when saving an entity using regular TypeORM repositories', async () => {
    const repository = connection.getRepository(TestEntity);

    const id = generateUniqueUUID();

    const entity = new TestEntity();
    entity.id = id;
    entity.propA = generateUniqueUUID();
    const entityReturnedFromCreation = await repository.save(entity);

    expect(entity).toBe(entityReturnedFromCreation);
    expect(entity.id).toBe(id);

    entity.propA = generateUniqueUUID();

    const entityReturnedFromUpdate = await repository.save(entity);

    expect(entity).toBe(entityReturnedFromUpdate);
  });
});
