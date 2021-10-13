import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

/**
 * BASE CLASS CREATED FOR TESTING!
 */
export abstract class _UserBase extends SimpleEntity {
  @Column('text', { unique: true })
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

  @DeleteDateColumn()
  deletedAt?: Date;

  toJSON() {
    return {
      ...this,
      passwordHash: undefined,
      passwordSalt: undefined,
    };
  }
}

@Entity('users')
export class User extends _UserBase {}
