import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';
import cluster from 'cluster';
import os from 'os';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { LoggingServiceSingleton } from '../logging/logging.service.singleton';
import { throwError } from '../utils/throw-error';

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

const IS_WORKER_THAT_CALLS_JOBS = EnvironmentVariablesService.variables
  .FORK_WORKERS
  ? isWorkerThatCallsJobsResult.value
  : true;

const totalCPUs = os.cpus().length;

type SlaveWorkerEntry = {
  listening?: boolean;
  isWorkerThatCallsJobs: boolean;
  worker: cluster.Worker;
};

const slaveWorkersMap = new Map<number, SlaveWorkerEntry>();

const WORKER_IS_LISTENING_KEY = 'cluster-worker-is-listening';

type WhenWorkerFailsBeforeStartHandler = () => void;

class ClusterModeServiceImpl {
  isMasterWorker: boolean;
  workerId: string;
  isWorkerThatCallsScheduledJobs: boolean | undefined;

  private shutdownStarted: boolean;

  private onMessageListener:
    | undefined
    | ((worker: cluster.Worker, message: unknown) => void);
  private onExitListener:
    | undefined
    | ((worker: cluster.Worker, code: number, signal: string) => void);
  private whenWorkerFailsBeforeStartHandler!: WhenWorkerFailsBeforeStartHandler;

  constructor() {
    this.isMasterWorker =
      cluster.isMaster || !EnvironmentVariablesService.variables.FORK_WORKERS;
    this.workerId = cluster.isMaster ? 'master' : `${cluster.worker.id}`;
    this.isWorkerThatCallsScheduledJobs = IS_WORKER_THAT_CALLS_JOBS;
    this.shutdownStarted = false;
  }

  fork() {
    if (!this.isMasterWorker) {
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

    const loggingService = LoggingServiceSingleton.getInstance();

    this.onMessageListener = (worker, message) => {
      if (message === WORKER_IS_LISTENING_KEY) {
        const workerEntry = slaveWorkersMap.get(worker.id) || throwError();

        slaveWorkersMap.set(worker.id, { ...workerEntry, listening: true });

        loggingService.logInfo(
          'cluster-mode-service:worker-is-listening',
          `Worker ${worker.id} is now listening to requests`,
        );
      }
    };

    this.onExitListener = (worker: cluster.Worker) => {
      const workerEntry = slaveWorkersMap.get(worker.id) || throwError();
      const isWorkerThatCallsJobs = workerEntry.isWorkerThatCallsJobs;

      if (!this.shutdownStarted) {
        /*
          Did the worker that crashed ever started correctly?

          This condition here avoids an endless loop of restarts
          in case the worker crashed while starting itself
        */
        if (workerEntry.listening) {
          slaveWorkersMap.delete(worker.id);

          const newWorker = cluster.fork({
            IS_WORKER_THAT_CALLS_JOBS: isWorkerThatCallsJobs,
          });

          slaveWorkersMap.set(newWorker.id, {
            worker: newWorker,
            isWorkerThatCallsJobs,
          });

          loggingService.logError(
            'cluster-mode-service:crashed-worker-restart',
            new Error(),
            `Will attempt to restart crashed worker \
as worker ${newWorker.id}...`,
          );
        } else {
          process.exitCode = 1;

          loggingService.logError(
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

      slaveWorkersMap.set(worker.id, { worker, isWorkerThatCallsJobs });
    }
  }

  markChildWorkerAsListening() {
    if (this.isMasterWorker) {
      throw new Error('Only child workers should mark themselves as connected');
    }

    cluster.worker.send(WORKER_IS_LISTENING_KEY);
  }

  flagAsShuttingDown() {
    if (!this.isMasterWorker) {
      throw new Error(
        'Only the master process should call shutdown() on the Cluster Service and do further cleanup',
      );
    }

    const loggingService = LoggingServiceSingleton.getInstance();

    this.shutdownStarted = true;

    const timeout = setTimeout(() => {
      process.exitCode = 1;

      for (const workerId in cluster.workers) {
        loggingService.logError(
          'cluster-mode-service:worker-did-not-shutdown',
          new Error(),
          { workerId },
        );

        const worker = cluster.workers[workerId] || throwError();

        worker.process.kill('SIGKILL');
      }

      const masterTimeout = setTimeout(() => {
        loggingService._onlyLogErrorToConsole(
          'cluster-mode-service:master-did-not-shutdown',
          new Error(),
        );

        process.exit();
      }, 10000);

      masterTimeout.unref();
    }, 30000);

    timeout.unref();
  }

  whenWorkerFailsBeforeStart(handler: WhenWorkerFailsBeforeStartHandler) {
    this.whenWorkerFailsBeforeStart = handler;
  }

  disconnectChildWorker() {
    if (this.isMasterWorker) {
      throw new Error();
    }

    if (cluster.isWorker) {
      cluster.worker.disconnect();
    }
  }
}

export const ClusterModeService = new ClusterModeServiceImpl();
