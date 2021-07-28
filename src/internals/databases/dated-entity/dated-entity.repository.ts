import {
  FindOneOptions,
  SimpleEntityRepository,
} from 'src/internals/databases/simple-entity/simple-entity.repository';
import { DatedEntity } from './dated.entity';
import { FindOptions } from '../simple-entity/simple-entity.repository';
import { EntityManager } from 'typeorm';

export abstract class DatedEntityRepository<
  Entity extends DatedEntity,
  FieldsOmittedBeforePersistence extends keyof Entity = never,
> extends SimpleEntityRepository<
  Entity,
  'createdAt' | 'updatedAt' | FieldsOmittedBeforePersistence
> {
  findOne(
    query: FindOneOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ): Promise<Entity | undefined> {
    return super.findOne(
      {
        ...query,
        order: query.order ?? {
          updatedAt: 'DESC',
        },
      },
      options,
    );
  }

  async find(
    query: FindOptions<Entity>,
    options?: Partial<{ manager: EntityManager }>,
  ) {
    return super.find(
      {
        ...query,
        order: query.order ?? {
          updatedAt: 'DESC',
        },
      },
      options,
    );
  }
}
