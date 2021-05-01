import { Token } from 'src/internals/tokens/token.entity';
import { Entity } from 'typeorm';

@Entity()
export class SignupVerificationToken extends Token {}
