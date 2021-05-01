import { User } from 'src/users/typeorm/user.entity';
import { AbstractRepository, LessThan, MoreThan } from 'typeorm';
import { Token } from './token.entity';

export abstract class TokensRepository<
  Entity extends Token
> extends AbstractRepository<Entity> {
  deleteExpired() {
    return this.repository.delete({
      expires: LessThan(Date.now()),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  deleteFromUser(user: User) {
    return this.repository.delete({
      user: user,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
  }

  public async createToken(user: User, ttl: number): Promise<Entity> {
    const ttlInMilliseconds = ttl * 1000;

    const TokenEntity = this.repository.target as { new (): Entity };

    const token = new TokenEntity();

    token.user = user;

    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttlInMilliseconds);

    token.expires = expiration;

    return this.repository.save(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      token as any,
    ) as Promise<Entity>;
  }

  public findTokenById(id: string) {
    return this.repository.findOne({
      where: {
        id,
        expires: MoreThan(Date.now()),
      },
    });
  }

  public findTokenByUser(user: User) {
    return this.repository.findOne({
      where: {
        user,
        expires: MoreThan(Date.now()),
      },
    });
  }
}
