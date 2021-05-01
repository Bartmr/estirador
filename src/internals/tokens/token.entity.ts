import { User } from 'src/users/typeorm/user.entity';
import { Column, ManyToOne, PrimaryColumn } from 'typeorm';

/*
  Only the first few characters of uuid v1 are random. The rest is based on the machine's MAC address.
  This makes uuid v1 generated ids vulnerable to brute force attacks (some times even only 22,000 are enough to break it)

  Since tokens are perishable and expire oftenly,
  it's better to use a totally random id generator, like uuid v4
*/

export abstract class Token {
  @PrimaryColumn('uuid', { default: () => 'uuid_generate_v4()' })
  id!: string;

  @ManyToOne(() => User, { eager: true })
  user!: User;

  @Column()
  expires!: Date;
}
