import { SimpleEntity } from 'src/internals/databases/simple-entity/simple.entity';
import { Column, Entity } from 'typeorm-bartmr';

@Entity()
export class Settings extends SimpleEntity {
  @Column('text')
  forInstance!: string;
}
