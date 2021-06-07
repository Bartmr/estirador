import { getEnumValues } from '@app/shared/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { AuditedEntity } from 'src/internals/auditing/audited-entity/audited.entity';
import { Column, Entity } from 'typeorm';
import { USER_ENTITY_TABLE_NAME } from './user-entity-table-name';

@Entity(USER_ENTITY_TABLE_NAME)
export class User extends AuditedEntity {
  @Column()
  email!: string;

  @Column()
  passwordHash!: string;

  @Column()
  passwordSalt!: string;

  @Column({ nullable: true })
  isVerified?: boolean;

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
