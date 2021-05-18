import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import cluster from 'cluster';
import os from 'os';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { throwError } from '../utils/throw-error';
import { LoggingService } from '../logging/logging.service';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';

if (NODE_ENV === NodeEnv.Test) {
  throw new Error();
}

const totalCPUs = os.cpus().length;

type ForkedWorkerEntry = {
  listening?: boolean;
  isWorkerThatCallsJobs: boolean;
  worker: cluster.Worker;
};

const forkedWorkersMap = new Map<number, ForkedWorkerEntry>();

const WORKER_IS_LISTENING_KEY = 'cluster-worker-is-listening';

const FINAL_SHUTDOWN_TIMEOUT = 30000 as number;
const SHUTDOWN_TIMEOUT = FINAL_SHUTDOWN_TIMEOUT - 10000;

if (SHUTDOWN_TIMEOUT <= 0) {
  throw new Error(
    `FINAL_SHUTDOWN_TIMEOUT: ${FINAL_SHUTDOWN_TIMEOUT}; SHUTDOWN_TIMEOUT: ${SHUTDOWN_TIMEOUT};`,
  );
}

type WhenWorkerFailsBeforeStartHandler = () => void;

class ClusterModeService {
  workerId: string;

  isWorkerThatForksMoreWorkers: boolean;
  isWorkerThatCallsOtherRelatedSetups: boolean;
  isWorkerThatCallsScheduledJobs: boolean;
  isForkedWorker: boolean;

  private shutdownStarted: boolean;

  private onMessageListener:
    | undefined
    | ((worker: cluster.Worker, message: unknown) => void);
  private onExitListener:
    | undefined
    | ((worker: cluster.Worker, code: number, signal: string) => void);
  private whenWorkerFailsBeforeStartHandler!: WhenWorkerFailsBeforeStartHandler;

  private loggingService: LoggingService;

  constructor(loggingService: LoggingService) {
    this.isWorkerThatForksMoreWorkers =
      EnvironmentVariablesService.variables.FORK_WORKERS && cluster.isMaster;

    this.isWorkerThatCallsOtherRelatedSetups =
      cluster.isMaster || !EnvironmentVariablesService.variables.FORK_WORKERS;

    this.workerId = cluster.isMaster ? 'master' : `${cluster.worker.id}`;

    this.isForkedWorker =
      EnvironmentVariablesService.variables.FORK_WORKERS && cluster.isWorker;

    const isWorkerThatCallsJobsResult = boolean().validate(
      // eslint-disable-next-line node/no-process-env
      process.env['IS_WORKER_THAT_CALLS_JOBS'],
    );

    if (isWorkerThatCallsJobsResult.errors) {
      throw new Error(
        `IS_WORKER_THAT_CALLS_JOBS environment variable is incorrectly set to ${
          // eslint-disable-next-line node/no-process-env, @typescript-eslint/restrict-template-expressions
          process.env['IS_WORKER_THAT_CALLS_JOBS']
        }`,
      );
    }

    this.isWorkerThatCallsScheduledJobs = EnvironmentVariablesService.variables
      .FORK_WORKERS
      ? isWorkerThatCallsJobsResult.value ?? false
      : true;

    this.loggingService = loggingService;

    this.shutdownStarted = false;
  }

  fork() {
    if (!this.isWorkerThatForksMoreWorkers) {
      throw new Error();
    }

    /*
      Webpack and Hot reload seem to start the server as a cluster worker already,
      and not as a master process.

      Not only that, Hot Reload makes it complicated to manage and shutdown child processes
      when reloading runtimes.

      Only call server clustering logic when running the code
      using `tsc` as build system
    */
    if (module.hot) throw new Error();

    if (this.onMessageListener || this.onExitListener) {
      throw new Error('Cannot fork twice');
    }

    this.onMessageListener = (worker, message) => {
      if (message === WORKER_IS_LISTENING_KEY) {
        const workerEntry = forkedWorkersMap.get(worker.id) || throwError();

        forkedWorkersMap.set(worker.id, { ...workerEntry, listening: true });

        this.loggingService.logInfo(
          'cluster-mode-service:worker-is-listening',
          `Worker ${worker.id} is now listening to requests`,
        );
      }
    };

    this.onExitListener = (worker: cluster.Worker) => {
      const workerEntry = forkedWorkersMap.get(worker.id) || throwError();
      const isWorkerThatCallsJobs = workerEntry.isWorkerThatCallsJobs;

      if (!this.shutdownStarted) {
        /*
          Did the worker that crashed ever started correctly?

          This condition here avoids an endless loop of restarts
          in case the worker crashed while starting itself
        */
        if (workerEntry.listening) {
          forkedWorkersMap.delete(worker.id);

          const newWorker = cluster.fork({
            IS_WORKER_THAT_CALLS_JOBS: isWorkerThatCallsJobs,
          });

          forkedWorkersMap.set(newWorker.id, {
            worker: newWorker,
            isWorkerThatCallsJobs,
          });

          this.loggingService.logError(
            'cluster-mode-service:crashed-worker-restart',
            new Error(),
            `Will attempt to restart crashed worker \
as worker ${newWorker.id}...`,
          );
        } else {
          process.exitCode = 1;

          this.loggingService.logError(
            'cluster-mode-service:worker-crashed-on-start',
            new Error(),
            `The crashed worker didn't even start. \
The worker will not be restarted in order to avoid an endless loop of failed launches.`,
          );

          for (const workerId in cluster.workers) {
            const worker = cluster.workers[workerId] || throwError();

            worker.process.kill('SIGTERM');
          }

          this.whenWorkerFailsBeforeStartHandler();
        }
      }
    };

    cluster.addListener('message', this.onMessageListener);
    cluster.addListener('exit', this.onExitListener);

    for (let i = 0; i < totalCPUs; i++) {
      const isWorkerThatCallsJobs = i === 0;
      const worker = cluster.fork({
        IS_WORKER_THAT_CALLS_JOBS: isWorkerThatCallsJobs,
      });

      forkedWorkersMap.set(worker.id, { worker, isWorkerThatCallsJobs });
    }
  }

  markWorkerAsListening() {
    if (this.isWorkerThatForksMoreWorkers) {
      throw new Error();
    }

    if (this.isForkedWorker) {
      cluster.worker.send(WORKER_IS_LISTENING_KEY);
    }
  }

  disconnectWorkerThatForkedMoreWorkers() {
    if (!this.isWorkerThatForksMoreWorkers) {
      throw new Error();
    }

    this.shutdownStarted = true;

    /*
      Wait for event loop to be empty by setting timeouts
    */
    const hangingWorkersTimeout = setTimeout(() => {
      process.exitCode = 1;

      const hangingWorkersIds = Object.keys(cluster.workers);

      if (hangingWorkersIds.length > 0) {
        this.loggingService._onlyLogErrorToConsole(
          'cluster-mode-service:hanging-workers',
          new Error(),
          { hangingWorkersIds },
        );

        for (const hangingWorkerId of hangingWorkersIds) {
          const hangingWorker =
            cluster.workers[hangingWorkerId] || throwError();

          hangingWorker.process.kill('SIGKILL');
        }
      }
    }, SHUTDOWN_TIMEOUT);

    hangingWorkersTimeout.unref();

    const finalTimeout = setTimeout(() => {
      process.exitCode = 1;

      this.loggingService._onlyLogErrorToConsole(
        'cluster-mode-service:master-still-hangs',
        new Error(),
        { stillHangingWorkersIds: Object.keys(cluster.workers) },
      );

      process.exit();
    }, FINAL_SHUTDOWN_TIMEOUT);

    finalTimeout.unref();
  }

  whenWorkerFailsBeforeStart(handler: WhenWorkerFailsBeforeStartHandler) {
    if (!this.isWorkerThatForksMoreWorkers) {
      throw new Error();
    }

    this.whenWorkerFailsBeforeStart = handler;
  }

  disconnectWorker() {
    if (this.isWorkerThatForksMoreWorkers) {
      throw new Error();
    }

    if (module.hot) {
      if (NODE_ENV === NodeEnv.Development) {
        // eslint-disable-next-line no-console
        console.info(`NOTE: Running Node as a child process (like Webpack with Hot Reload does) makes workers hang even if the event loop is empty.
To test graceful shutdowns, use npm run start:dev:tsc or npm run start:debug:tsc instead.`);

        process.exit();
      } else {
        throw new Error();
      }
    }

    if (this.isForkedWorker) {
      process.disconnect();
    } else {
      /*
        Log if only worker does not empty event loop and exits during the designated timeout
      */
      const timeout = setTimeout(() => {
        process.exitCode = 1;

        this.loggingService._onlyLogErrorToConsole(
          'cluster-mode-service:only-worker-did-not-exit-gracefully',
          new Error(),
        );

        process.exit();
      }, SHUTDOWN_TIMEOUT);

      timeout.unref();
    }
  }
}

let instance: ClusterModeService | undefined;

export const ClusterModeServiceSingleton = {
  getInstance: () => instance || throwError(),
  makeInstance: (loggingService: LoggingService) => {
    if (instance) {
      throw new Error('Only one instance per worker');
    }

    if (
      (cluster.isMaster ||
        !EnvironmentVariablesService.variables.FORK_WORKERS) &&
      /*
        Running Node as a child process (like Webpack with Hot Reload does)
        makes workers hang even if the event loop is empty
      */
      !module.hot
    ) {
      process.on('beforeExit', () => {
        if (!process.exitCode) {
          loggingService.logInfo(
            'all-workers-shut-down-correctly',
            'All workers shut down correctly',
          );
        }
      });
    }

    instance = new ClusterModeService(loggingService);

    return instance;
  },
};
