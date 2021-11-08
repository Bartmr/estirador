import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { User } from 'src/users/typeorm/user.entity';
import { AuthTokensRepository } from './auth-token.repository';
import { Connection, EntityManager } from 'typeorm';
import { JobsConfigService } from 'src/internals/jobs/config/jobs-config.service';

@Injectable()
export class AuthTokensService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private tokenCleanupInterval?: NodeJS.Timeout;
  private tokensRepository: AuthTokensRepository;

  constructor(
    @InjectConnection() connection: Connection,
    private loggingService: LoggingService,
    private jobsConfigService: JobsConfigService,
  ) {
    this.tokensRepository =
      connection.getCustomRepository(AuthTokensRepository);
  }

  onApplicationBootstrap() {
    if (this.jobsConfigService.shouldCallScheduledJobs) {
      this.tokenCleanupInterval = setInterval(() => {
        this.cleanupExpiredAuthTokens().catch((error) => {
          this.loggingService.logError(
            'token-service:token-cleanup-interval',
            error,
          );
        });
      }, 1000 * 60 * 60);
    }
  }

  onApplicationShutdown() {
    if (this.tokenCleanupInterval) {
      clearInterval(this.tokenCleanupInterval);
    }
  }

  private cleanupExpiredAuthTokens() {
    return this.tokensRepository.deleteExpired();
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
