import { User } from 'src/users/typeorm/user.entity';
import {
  AbstractRepository,
  EntityRepository,
  LessThan,
  MoreThan,
} from 'typeorm';
import { AuthToken } from './typeorm/auth-token.entity';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';

@EntityRepository(AuthToken)
export class AuthTokensRepository extends AbstractRepository<AuthToken> {
  deleteExpired() {
    return this.repository.delete({
      expires: LessThan(new Date()),
    });
  }

  deleteToken(tokenString: string) {
    return this.repository.delete({
      id: tokenString,
    });
  }

  public async createToken(user: User, ttl: number): Promise<AuthToken> {
    const ttlInMilliseconds = ttl * 1000;

    const token = new AuthToken();

    token.httpOnlyKey = generateRandomUUID();

    token.user = user;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttlInMilliseconds);

    token.expires = expiration;

    return this.repository.save(token);
  }

  public findTokenById(id: string) {
    return this.repository.findOne({
      where: {
        id,
        expires: MoreThan(new Date()),
      },
    });
  }

  public findTokenByUser(user: User) {
    return this.repository.findOne({
      where: {
        user,
        expires: MoreThan(new Date()),
      },
    });
  }
}
