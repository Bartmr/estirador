import { SimpleEntityRepository } from 'src/internals/databases/simple-entity/simple-entity.repository';
import { EntityRepository } from 'typeorm';
import { User } from './typeorm/user.entity';

/**
 * BASE CLASS CREATED FOR TESTING!
 */
export abstract class _UsersRepositoryBase extends SimpleEntityRepository<
  User,
  'deletedAt'
> {}

@EntityRepository(User)
export class UsersRepository extends _UsersRepositoryBase {}
