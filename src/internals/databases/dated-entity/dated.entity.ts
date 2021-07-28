import { CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';

export abstract class DatedEntity extends SimpleEntity {
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
