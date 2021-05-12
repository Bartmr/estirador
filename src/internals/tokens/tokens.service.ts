import { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { LoggingService } from 'src/internals/logging/logging.service';
import { ClusterModeServiceSingleton } from '../server/cluster-mode-service';
import { Token } from './token.entity';
import { TokensRepository } from './tokens.repository';

export abstract class TokensService<Repository extends TokensRepository<Token>>
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private tokenCleanupInterval?: NodeJS.Timeout;

  constructor(
    protected tokensRepository: Repository,
    protected loggingService: LoggingService,
  ) {}

  onApplicationBootstrap() {
    const clusterModeService = ClusterModeServiceSingleton.getInstance();

    if (clusterModeService.isWorkerThatCallsScheduledJobs) {
      this.tokenCleanupInterval = setInterval(() => {
        this.cleanupExpiredRefreshTokens().catch((error) => {
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

  private cleanupExpiredRefreshTokens() {
    return this.tokensRepository.deleteExpired();
  }
}
