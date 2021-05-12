/* eslint-disable no-console */
import { inspect } from 'util';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { ClusterModeServiceSingleton } from '../server/cluster-mode-service';
import { LoggingService } from './logging.service';

function nestedValuesToString(value: unknown) {
  return inspect(value, undefined, 10);
}

/*
  WARNING:
  due to the terminal output being asynchronous,
  if you have to use `console` to log anything, make it in a single call,
  or else the output will come out unordered,
  and without a correct reference to the worker that did that `console` call.
*/

class LoggingServiceImpl extends LoggingService {
  logDebug(key: string, extraData?: unknown) {
    const clusterModeService = ClusterModeServiceSingleton.getInstance();

    if (EnvironmentVariablesService.variables.LOG_DEBUG) {
      console.log(
        `----- DEBUG [Worker ${clusterModeService.workerId}]:`,
        key,
        '\nExtra data:',
        nestedValuesToString(extraData),
        '\n-----',
      );
    }
  }

  logInfo(key: string, message: string, extraData?: unknown) {
    const clusterModeService = ClusterModeServiceSingleton.getInstance();

    console.info(
      `[Worker ${clusterModeService.workerId}] ` + 'Info:',
      key,
      '\nMessage:',
      message,
      '\nExtra data:',
      nestedValuesToString(extraData),
      '\n-----',
    );
  }

  logWarning(key: string, message: string, extraData?: unknown) {
    const clusterModeService = ClusterModeServiceSingleton.getInstance();

    console.warn(
      `[Worker ${clusterModeService.workerId}] `,
      'Warning:',
      key,
      '\nMessage:',
      message,
      '\nExtra data:',
      nestedValuesToString(extraData),
      '\n-----',
    );
  }

  logError(
    key: string,
    /*
        In Javascript, any value type can be thrown,
        so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ) {
    this._onlyLogErrorToConsole(key, caughtValue, extraData);
  }

  _onlyLogErrorToConsole(
    key: string,
    /*
        In Javascript, any value type can be thrown,
        so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ) {
    const caughtValueIsInstanceOfError = caughtValue instanceof Error;
    const error = caughtValueIsInstanceOfError
      ? (caughtValue as Error)
      : new Error();

    const clusterModeService = ClusterModeServiceSingleton.getInstance();

    console.error(
      `[Worker ${clusterModeService.workerId}] ` + 'Error:' + key,
      '\nError:',
      nestedValuesToString(error),
      !caughtValueIsInstanceOfError
        ? '\nCaught Value was not an instance of Error:'
        : '',
      !caughtValueIsInstanceOfError ? nestedValuesToString(caughtValue) : '',
      '\nExtra data:',
      nestedValuesToString(extraData),
      '\n-----',
    );
  }
}

let instance: LoggingServiceImpl | undefined;

export const LoggingServiceSingleton = {
  makeInstance(): LoggingServiceImpl {
    instance = new LoggingServiceImpl();

    return instance;
  },
  getInstance(): LoggingServiceImpl {
    if (!instance) {
      throw new Error();
    }

    return instance;
  },
};
