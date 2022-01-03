import 'source-map-support/register';
import 'src/internals/environment/load-environment-variables';

import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { NODE_ENV } from './internals/environment/node-env.constants';
import { NodeEnv } from './internals/environment/node-env.types';
import type { hotReloadDatabases } from './internals/databases/hot-reload-databases';
import { UnwrapPromise } from 'libs/shared/src/internals/utils/types/promise-types';
import { ProcessType } from './internals/process/process-context';
import { ProcessContextManager } from './internals/process/process-context-manager';
import { generateRandomUUID } from './internals/utils/generate-random-uuid';
import { createApp } from './create-app';

type ModuleHotData = {
  closingPromise?: Promise<unknown>;
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

  let hotReloadedDatabasesResult:
    | UnwrapPromise<ReturnType<typeof hotReloadDatabases>>
    | undefined = undefined;
  if (NODE_ENV === NodeEnv.Development) {
    const { hotReloadDatabases: hotReloadDatabasesImpl } = await import(
      './internals/databases/hot-reload-databases'
    );
    hotReloadedDatabasesResult = await hotReloadDatabasesImpl();
  }

  /*
    Some tools like nodemon use the SIGUSR2 signal
    to communicate a full restart

    We only need that signal when we are NOT using Hot Reload during development
  */
  const listenToSIGUSR2 = NODE_ENV === NodeEnv.Development && !module.hot;

  const app = await createApp();

  const shutdown = async () => {
    const timeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error(`server:hanging-process`);
      process.exit(1);
    }, 30000);
    timeout.unref();

    process.removeListener('SIGTERM', shutdownHandler);
    process.removeListener('SIGINT', shutdownHandler);
    if (listenToSIGUSR2) {
      process.removeListener('SIGUSR2', shutdownHandler);
    }

    await app.close();

    if (hotReloadedDatabasesResult) {
      await Promise.all(hotReloadedDatabasesResult.map((c) => c.close()));
    }
  };

  const shutdownHandler = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    shutdown();
  };

  process.on('SIGTERM', shutdownHandler);
  process.on('SIGINT', shutdownHandler);
  if (listenToSIGUSR2) {
    process.on('SIGUSR2', shutdownHandler);
  }

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose((data: ModuleHotData) => {
      process.removeListener('SIGTERM', shutdownHandler);
      process.removeListener('SIGINT', shutdownHandler);
      if (listenToSIGUSR2) {
        process.removeListener('SIGUSR2', shutdownHandler);
      }

      loggingService.logInfo('shutting-down', 'Shutting down');

      data.closingPromise = app.close();
    });
  }

  await app.listen(3000);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
