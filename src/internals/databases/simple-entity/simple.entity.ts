import { PrimaryColumn } from 'typeorm';

export abstract class SimpleEntity {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v1mc()' })
  id!: string;
}
