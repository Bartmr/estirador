import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { User } from 'src/users/typeorm/user.entity';
import { AuthTokensRepository } from './auth-token.repository';
import { Connection, EntityManager } from 'typeorm';

@Injectable()
export class AuthTokensService {
  private tokensRepository: AuthTokensRepository;

  constructor(@InjectConnection() connection: Connection) {
    this.tokensRepository =
      connection.getCustomRepository(AuthTokensRepository);
  }

  async createAuthToken(manager: EntityManager, user: User) {
    const tokensRepository = manager.getCustomRepository(AuthTokensRepository);

    const ttl = EnvironmentVariablesService.variables.AUTH_TOKEN_TTL;

    const token = await tokensRepository.createToken(user, ttl);

    return token;
  }

  public async validateAuthToken(
    authTokenId: string,
    httpOnlyAuthTokenKey: string,
  ): Promise<User> {
    const authToken = await this.findToken(authTokenId);

    if (!authToken) {
      throw new UnauthorizedException();
    }

    if (authToken.httpOnlyKey !== httpOnlyAuthTokenKey) {
      throw new UnauthorizedException();
    }

    const user = authToken.user;

    if (user.deletedAt) {
      throw new UnauthorizedException();
    }

    return user;
  }

  deleteToken(tokenString: string) {
    return this.tokensRepository.deleteToken(tokenString);
  }

  findToken(tokenString: string) {
    return this.tokensRepository.findTokenById(tokenString);
  }
}
