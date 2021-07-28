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
      expires: LessThan(Date.now()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  deleteToken(tokenString: string) {
    return this.repository.delete({
      id: tokenString,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  public async createToken(user: User, ttl: number): Promise<AuthToken> {
    const ttlInMilliseconds = ttl * 1000;

    const token = new AuthToken();

    token.id = generateRandomUUID();
    token.httpsOnlyKey = generateRandomUUID();

    token.user = user;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttlInMilliseconds);

    token.expires = expiration;

    return this.repository.save(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token as any,
    ) as Promise<AuthToken>;
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
