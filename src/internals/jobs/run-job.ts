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

/*
  TODO
  logging and error handling
*/

export function prepareJob(
  jobId: string,
  jobFunction: JobFunction,
  dependencies: Dependencies,
): () => Promise<void> {
  ProcessContextManager.setContext({
    type: ProcessType.Job,
    name: jobId,
    workerId: generateRandomUUID(),
  });

  return async (): Promise<void> => {
    const { loggingService } = dependencies;

    try {
      await jobFunction({
        loggingService,
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`${jobId}:try-catch:console`, err);
      dependencies.loggingService.logError(`${jobId}:try-catch`, err);

      const timeout = setTimeout(() => {
        process.exit(1);
      }, 30000);
      timeout.unref();
    }
  };
}
