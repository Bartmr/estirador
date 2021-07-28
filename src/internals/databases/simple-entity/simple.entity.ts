import { PrimaryColumn } from 'typeorm';

export abstract class SimpleEntity {
  @PrimaryColumn('uuid')
  id!: string;
}
