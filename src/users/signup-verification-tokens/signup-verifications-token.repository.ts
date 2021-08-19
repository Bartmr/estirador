import {
  AbstractRepository,
  EntityRepository,
  LessThan,
  MoreThan,
} from 'typeorm';
import { User } from '../typeorm/user.entity';
import { SignupVerificationToken } from './typeorm/signup-verification-token.entity';
import { generateRandomUUID } from '../../internals/utils/generate-random-uuid';

@EntityRepository(SignupVerificationToken)
export class SignupVerificationTokensRepository extends AbstractRepository<SignupVerificationToken> {
  deleteExpired() {
    return this.repository.delete({
      expires: LessThan(new Date()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  deleteFromUser(user: User) {
    return this.repository.delete({
      user: user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  public async createToken(user: User, ttl: number) {
    const ttlInMilliseconds = ttl * 1000;

    const token = new SignupVerificationToken();

    token.id = generateRandomUUID();

    token.user = user;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttlInMilliseconds);

    token.expires = expiration;

    return this.repository.save(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token as any,
    ) as Promise<SignupVerificationToken>;
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
