import { getEnumValues } from '@app/shared/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { AuditedEntity } from 'src/internals/auditing/audited-entity/audited.entity';
import { Column, Entity } from 'typeorm';

/**
 * BASE CLASS CREATED FOR TESTING!
 */
export abstract class _UserBase extends AuditedEntity {
  @Column('text')
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  passwordSalt!: string;

  @Column('boolean', { nullable: true })
  isVerified?: boolean | null;

  @Column({
    type: 'enum',
    enum: getEnumValues(Role),
  })
  role!: Role;

  toJSON() {
    return {
      ...super.toJSON(),
      passwordHash: undefined,
      passwordSalt: undefined,
    };
  }
}

@Entity('users')
export class User extends _UserBase {}
