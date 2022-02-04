/* eslint-disable no-console */
import { inspect } from 'util';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { LoggingService } from './logging.service';

if (NODE_ENV === NodeEnv.Test) {
  throw new Error(
    'Do not import this logging implementation in testing environments. Use a mock instead',
  );
}

function nestedValuesToString(value: unknown) {
  return inspect(value, undefined, 10);
}

/*
  TODO: connect to the logging provider

  Cases:
  - Regular caught errors
  - Uncaught errors and unhandled promise rejections
  - Process and workers hanging on shutdown
*/

class LoggingServiceImpl extends LoggingService {
  logDebug(key: string, extraData?: unknown) {
    if (EnvironmentVariablesService.variables.LOG_DEBUG) {
      console.log(
        `----- DEBUG:`,
        key,
        '\nExtra data:',
        nestedValuesToString(extraData),
        '\n-----',
      );
    }
  }

  logInfo(key: string, message: string, extraData?: unknown) {
    console.info(
      'Info:',
      key,
      '\nMessage:',
      message,
      '\nExtra data:',
      nestedValuesToString(extraData),
      '\n-----',
    );
  }

  logWarning(key: string, message: string, extraData?: unknown) {
    console.warn(
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
    this.logErrorToConsole(key, caughtValue, extraData);
  }

  private logErrorToConsole(
    key: string,
    /*
        In Javascript, any value type can be thrown,
        so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ) {
    const caughtValueIsInstanceOfError = caughtValue instanceof Error;
    const error = caughtValueIsInstanceOfError ? caughtValue : new Error();

    console.error(
      'Error:' + key,
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
