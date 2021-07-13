import { AuditedEntityRepository } from 'src/internals/auditing/audited-entity/audited-entity.repository';
import { EntityRepository } from 'typeorm';
import { User } from './typeorm/user.entity';

/**
 * BASE CLASS CREATED FOR TESTING!
 */
export abstract class _UsersRepositoryBase extends AuditedEntityRepository<User> {}

@EntityRepository(User)
export class UsersRepository extends _UsersRepositoryBase {}
