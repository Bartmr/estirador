import { PrimaryGeneratedColumn } from 'typeorm-bartmr';

export abstract class SimpleEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
