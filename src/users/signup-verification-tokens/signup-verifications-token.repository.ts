import { TokensRepository } from 'src/internals/tokens/tokens.repository';
import { EntityRepository } from 'typeorm';
import { SignupVerificationToken } from './typeorm/signup-verification-token.entity';

@EntityRepository(SignupVerificationToken)
export class SignupVerificationTokensRepository extends TokensRepository<SignupVerificationToken> {}
