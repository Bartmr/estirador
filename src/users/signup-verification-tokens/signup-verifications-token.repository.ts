import {
  AbstractRepository,
  EntityRepository,
  LessThan,
  MoreThan,
} from 'typeorm';
import { User } from '../typeorm/user.entity';
import { SignupVerificationToken } from './typeorm/signup-verification-token.entity';

@EntityRepository(SignupVerificationToken)
export class SignupVerificationTokensRepository extends AbstractRepository<SignupVerificationToken> {
  deleteExpired() {
    return this.repository.delete({
      expires: LessThan(new Date()),
    });
  }

  deleteFromUser(user: User) {
    return this.repository.delete({
      user: user,
    });
  }

  public async createToken(
    user: User,
    ttl: number,
  ): Promise<SignupVerificationToken> {
    const ttlInMilliseconds = ttl * 1000;

    const token = new SignupVerificationToken();

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
