import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { Role } from 'src/auth/roles/roles';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, DeleteDateColumn, Entity } from 'typeorm';

@Entity()
export class User extends SimpleEntity {
  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: getEnumValues(Role),
  })
  role!: Role;
}
