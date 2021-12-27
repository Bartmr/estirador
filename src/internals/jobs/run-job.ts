import 'source-map-support/register';
import '../environment/load-environment-variables';

import type { LoggingService } from '../logging/logging.service';
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
        );

        process.exit(1);
      }, 20000);
      killTimeout.unref();

      loggingService.logError('run-job', err);

      throw err;
    }
  };
}
