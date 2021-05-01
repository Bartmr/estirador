import 'source-map-support/register';
import '../environment/load-environment-variables';

import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import type { LoggingService } from '../logging/logging.service';
import { LoggingServiceSingleton } from '../logging/logging.service.singleton';
import { ProcessType } from '../process/process-context';
import { ProcessContextManager } from '../process/process-context-manager';
import { generateRandomUUID } from '../utils/generate-random-uuid';

type Dependencies = {
  loggingService: LoggingService;
};

type JobFunction = (dependencies: Dependencies) => Promise<void>;

export function prepareJob(
  jobName: string,
  jobFunction: JobFunction,
  dependencies: Dependencies,
): () => Promise<void> {
  ProcessContextManager.setContext({
    type: ProcessType.Job,
    name: jobName,
    workerId: generateRandomUUID(),
  });

  return async (): Promise<void> => {
    const { loggingService } = dependencies;

    try {
      await jobFunction({
        loggingService,
      });
    } catch (err: unknown) {
      const killTimeout = setTimeout(() => {
        loggingService._onlyLogErrorToConsole(
          'job-did-not-shutdown-correctly',
          new Error(),
          {
            exitCode: process.exitCode,
          },
        );

        process.exit(1);
      }, 20000);
      killTimeout.unref();

      loggingService.logError('run-job', err);

      throw err;
    }
  };
}

/**
 * When in a testing environment, the job won't run right away.
 * Instead, you need to call the function returned by this method
 * to run the job and test it's side effects.
 */
export function prepareAndRunJob(
  jobName: string,
  jobFunction: JobFunction,
  dependencies: Dependencies,
): () => Promise<void> {
  const loggingServiceSingleton = LoggingServiceSingleton.makeInstance();

  const job = prepareJob(jobName, jobFunction, dependencies);

  if (NODE_ENV === NodeEnv.Test) {
    return job;
  } else {
    job().catch(() => {
      process.exit(1);
    });

    return async () => {
      loggingServiceSingleton.logError(
        'run-job:already-running',
        new Error('Job is already running'),
      );
    };
  }
}
