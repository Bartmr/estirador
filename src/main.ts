import 'source-map-support/register';
import 'src/internals/environment/load-environment-variables';

import {
  ClusterModeServiceSingleton,
  ClusterModeServiceType,
} from './internals/server/cluster-mode-service';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { NODE_ENV } from './internals/environment/node-env.constants';
import { NodeEnv } from './internals/environment/node-env.types';
import type { hotReloadDatabases } from './internals/databases/hot-reload-databases';
import { UnwrapPromise } from '@app/shared/internals/utils/types/promise-types';
import { ProcessType } from './internals/process/process-context';
import { ProcessContextManager } from './internals/process/process-context-manager';
import { generateRandomUUID } from './internals/utils/generate-random-uuid';

type ModuleHotData = {
  closingPromise?: Promise<unknown>;
  clusterModeService?: ClusterModeServiceType;
};

ProcessContextManager.setContext({
  type: ProcessType.WebServer,
  name: ProcessType.WebServer,
  workerId: generateRandomUUID(),
});

async function bootstrap() {
  const closingPromise = (module.hot?.data as ModuleHotData | undefined)
    ?.closingPromise;
  if (closingPromise) {
    await closingPromise;
  }

  const loggingService = LoggingServiceSingleton.makeInstance();
  const clusterModeService =
    (module.hot?.data as ModuleHotData | undefined)?.clusterModeService ||
    ClusterModeServiceSingleton.makeInstance(loggingService);

  let hotReloadedDatabasesResult:
    | UnwrapPromise<ReturnType<typeof hotReloadDatabases>>
    | undefined = undefined;
  if (
    NODE_ENV === NodeEnv.Development &&
    clusterModeService.isWorkerThatCallsOtherRelatedSetups
  ) {
    const { hotReloadDatabases } = await import(
      './internals/databases/hot-reload-databases'
    );
    hotReloadedDatabasesResult = await hotReloadDatabases();
  }

  /*
    Some tools like nodemon use the SIGUSR2 signal
    to communicate a full restart

    We only need that signal when we are NOT using Hot Reload during development
  */
  const listenToSIGUSR2 = NODE_ENV === NodeEnv.Development && !module.hot;

  /*
    TODO: log uncaught exceptions and unhandled promise rejections here,
    so they appear on the logs even if the master / child worker exits unexpectedly
  */

  if (clusterModeService.isWorkerThatForksMoreWorkers) {
    const masterShutdownSignalHandler = () => {
      process.removeListener('SIGTERM', masterShutdownSignalHandler);
      process.removeListener('SIGINT', masterShutdownSignalHandler);
      if (listenToSIGUSR2) {
        process.removeListener('SIGUSR2', masterShutdownSignalHandler);
      }

      loggingService.logInfo(
        'forker-of-workers-started-shutting-down',
        'Worker that forks more workers started shutting down',
      );

      const shutdown = async () => {
        if (hotReloadedDatabasesResult) {
          await Promise.all(hotReloadedDatabasesResult.map((c) => c.close()));
        }

        clusterModeService.disconnectWorkerThatForkedMoreWorkers();
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      shutdown();
    };

    process.on('SIGTERM', masterShutdownSignalHandler);
    process.on('SIGINT', masterShutdownSignalHandler);
    if (listenToSIGUSR2) {
      process.on('SIGUSR2', masterShutdownSignalHandler);
    }
    clusterModeService.whenWorkerFailsBeforeStart(masterShutdownSignalHandler);

    clusterModeService.fork();
  } else {
    const { createApp } = await import('./create-app');

    const app = await createApp();

    const workerShutdown = (
      args: { isHotReload: false } | { isHotReload: true; data: ModuleHotData },
    ) => {
      process.removeListener('SIGTERM', workerShutdownSignalHandler);
      process.removeListener('SIGINT', workerShutdownSignalHandler);
      if (listenToSIGUSR2) {
        process.removeListener('SIGUSR2', workerShutdownSignalHandler);
      }

      loggingService.logInfo(
        'worker-started-shutting-down',
        'Worker started shutting down',
      );

      const shutdown = async () => {
        if (args.isHotReload) {
          args.data.closingPromise = app.close();
          args.data.clusterModeService = clusterModeService;
        } else {
          await app.close();

          if (hotReloadedDatabasesResult) {
            await Promise.all(hotReloadedDatabasesResult.map((c) => c.close()));
          }

          clusterModeService.disconnectWorker();
        }
      };

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      shutdown();
    };

    const workerShutdownSignalHandler = () => {
      workerShutdown({ isHotReload: false });
    };

    process.on('SIGTERM', workerShutdownSignalHandler);
    process.on('SIGINT', workerShutdownSignalHandler);
    if (listenToSIGUSR2) {
      process.on('SIGUSR2', workerShutdownSignalHandler);
    }

    if (module.hot) {
      module.hot.accept();
      module.hot.dispose((data: ModuleHotData) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        workerShutdown({ isHotReload: true, data });
      });
    }

    await app.listen(3000);

    clusterModeService.markWorkerAsListening();
  }
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
