import { TokensRepository } from 'src/internals/tokens/tokens.repository';
import { EntityRepository } from 'typeorm';
import { RefreshToken } from './typeorm/refresh-token.entity';

@EntityRepository(RefreshToken)
export class RefreshTokensRepository extends TokensRepository<RefreshToken> {}
