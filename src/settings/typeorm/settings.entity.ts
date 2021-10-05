import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Entity } from 'typeorm';

@Entity()
export class Settings extends SimpleEntity {}
