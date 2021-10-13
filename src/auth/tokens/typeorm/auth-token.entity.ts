import { User } from 'src/users/typeorm/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  httpsOnlyKey!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column()
  expires!: Date;
}
