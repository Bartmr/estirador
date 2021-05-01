import { AuditedEntityRepository } from 'src/internals/auditing/audited-entity/audited-entity.repository';
import { EntityRepository } from 'typeorm';
import { User } from './typeorm/user.entity';

@EntityRepository(User)
export class UsersRepository extends AuditedEntityRepository<User> {}
