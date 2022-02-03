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

export function prepareJob(
  jobName: string,
  jobFunction: JobFunction,
): () => void {
  const runAsync = async (): Promise<void> => {
    ProcessContextManager.setContext({
      type: ProcessType.Job,
      name: jobName,
      workerId: generateRandomUUID(),
    });

    const loggingService = LoggingServiceSingleton.makeInstance();

    try {
      await jobFunction({
        loggingService,
      });
    } catch (err) {
      loggingService.logError(`${jobName}:run`, err);
    }

    const timeout = setTimeout(() => {
      // eslint-disable-next-line no-console
      console.error(`${jobName}:hanging-process`);
      process.exit(1);
    }, 30000);
    timeout.unref();
  };

  const run = () => {
    runAsync().catch((err) => {
      // eslint-disable-next-line no-console
      console.error(`${jobName}:setup`, err);
      process.exit(1);
    });
  };

  return run;
}
