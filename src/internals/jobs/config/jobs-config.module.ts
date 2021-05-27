import { Module } from '@nestjs/common';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { JobsConfigService } from './jobs-config.service';

@Module({
  providers: [
    {
      provide: JobsConfigService,
      useFactory: async () => {
        if (NODE_ENV === NodeEnv.Test) {
          return new JobsConfigService({ shouldCallScheduledJobs: false });
        } else {
          const clusterModeSingletonModule = await import(
            '../../server/cluster-mode-service'
          );

          const clusterModeService =
            clusterModeSingletonModule.ClusterModeServiceSingleton.getInstance();

          return new JobsConfigService({
            shouldCallScheduledJobs:
              clusterModeService.isWorkerThatCallsScheduledJobs,
          });
        }
      },
    },
  ],
  exports: [JobsConfigService],
})
export class JobsConfigModule {}
