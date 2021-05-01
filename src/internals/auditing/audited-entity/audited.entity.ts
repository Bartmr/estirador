import { Column, DeleteDateColumn, PrimaryColumn } from 'typeorm';

/*
  Use Postgres uuid v1mc instead of v1 in order
  to prevent the database MAC address from being identified
*/

export abstract class AuditedEntity {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v1mc()' })
  id!: string;

  @DeleteDateColumn()
  archivedAt?: Date;

  @Column('uuid', { default: () => 'uuid_generate_v1mc()' })
  instanceId!: string;

  @Column('uuid', { nullable: true })
  operationId?: string;

  @Column({ nullable: true, select: false })
  requestPath?: string;

  @Column({ nullable: true, select: false })
  requestMethod?: string;

  @Column({ nullable: true, select: false })
  processId?: string;

  @Column('uuid', { nullable: true, select: false })
  archivedByUserId?: string;

  // Set in AuditedEntityRepository. No need for @CreatedAtColumn()
  @Column('timestamp')
  createdAt!: Date;

  // Set in AuditedEntityRepository. No need for @UpdatedAtColumn()
  @Column('timestamp')
  updatedAt!: Date;
}
