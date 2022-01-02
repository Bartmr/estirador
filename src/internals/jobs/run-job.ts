import 'source-map-support/register';
import '../environment/load-environment-variables';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';

import type { LoggingService } from '../logging/logging.service';
import { LoggingServiceSingleton } from '../logging/logging.service.singleton';
import { ProcessType } from '../process/process-context';
import { ProcessContextManager } from '../process/process-context-manager';
import { generateRandomUUID } from '../utils/generate-random-uuid';

if (NODE_ENV === NodeEnv.Test) {
  throw new Error(
    `Test the job function without wrapping it in prepareJob() or even importing this file.
Place the job function into a new file, and test it by importing said new file`,
  );
}

type Dependencies = {
  loggingService: LoggingService;
};
type JobFunction = (dependencies: Dependencies) => Promise<void>;

/*
  TODO
  logging and error handling
*/

export function prepareJob(
  jobId: string,
  jobFunction: JobFunction,
): () => void {
  ProcessContextManager.setContext({
    type: ProcessType.Job,
    name: jobId,
    workerId: generateRandomUUID(),
  });

  const runAsync = async (): Promise<void> => {
    let loggingService: LoggingService;

    try {
      loggingService = LoggingServiceSingleton.makeInstance();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`${jobId}:setup-dependencies:console`, err);
      process.exit(1);
    }

    try {
      await jobFunction({
        loggingService,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`${jobId}:try-catch:console`, err);
      loggingService.logError(`${jobId}:try-catch`, err);

      const timeout = setTimeout(() => {
        process.exit(1);
      }, 30000);
      timeout.unref();
    }
  };

  const run = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    runAsync();
  };

  return run;
}
