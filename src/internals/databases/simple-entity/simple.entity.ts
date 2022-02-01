import { PrimaryGeneratedColumn } from 'typeorm';

export abstract class SimpleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
