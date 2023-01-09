import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, DeleteDateColumn } from 'typeorm';

/*
  Use Postgres uuid v1mc instead of v1 in order
  to prevent the database MAC address from being identified
*/

export abstract class AuditedEntity extends SimpleEntity {
  @Column('text', {
    default: () => "uuid_generate_v4()||'-'||extract(epoch from now())",
  })
  instanceId!: string;

  @DeleteDateColumn()
  deletedAt!: Date | null;

  @Column('timestamp')
  recoveredAt!: Date | null;

  @Column('text', { nullable: true })
  operationId!: string | null;

  @Column('text', { nullable: true })
  requestPath!: string | null;

  @Column('text', { nullable: true })
  requestMethod!: string | null;

  @Column('text', { nullable: true })
  processId!: string | null;

  @Column('uuid', { nullable: true })
  archivedByUserId!: string | null;

  // Set in AuditedEntityRepository. No need for @CreatedAtColumn()
  @Column('timestamp')
  createdAt!: Date;

  // Set in AuditedEntityRepository. No need for @UpdatedAtColumn()
  @Column('timestamp')
  updatedAt!: Date;
}
