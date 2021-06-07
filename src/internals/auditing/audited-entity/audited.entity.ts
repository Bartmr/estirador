import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, DeleteDateColumn } from 'typeorm';

/*
  Use Postgres uuid v1mc instead of v1 in order
  to prevent the database MAC address from being identified
*/

export abstract class AuditedEntity extends SimpleEntity {
  @DeleteDateColumn()
  deletedAt?: Date;

  @Column('uuid', { default: () => 'uuid_generate_v1mc()' })
  instanceId!: string;

  @Column('uuid', { nullable: true })
  operationId?: string;

  @Column({ nullable: true })
  requestPath?: string;

  @Column({ nullable: true })
  requestMethod?: string;

  @Column({ nullable: true })
  processId?: string;

  @Column('uuid', { nullable: true })
  archivedByUserId?: string;

  // Set in AuditedEntityRepository. No need for @CreatedAtColumn()
  @Column('timestamp')
  createdAt!: Date;

  // Set in AuditedEntityRepository. No need for @UpdatedAtColumn()
  @Column('timestamp')
  updatedAt!: Date;

  toJSON() {
    return {
      ...this,
      requestPath: undefined,
      requestMethod: undefined,
      processId: undefined,
      archivedByUserId: undefined,
    };
  }
}
