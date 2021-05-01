/* eslint-disable no-console */
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { inspect } from 'util';

const SHOW_ALL_LOGS_IN_TESTS =
  EnvironmentVariablesService.variables.SHOW_ALL_LOGS_IN_TESTS;

class LoggingTestService extends LoggingService {
  logDebug(...args: unknown[]): void {
    if (SHOW_ALL_LOGS_IN_TESTS) {
      console.log(inspect(args, undefined, 30));
    }
  }
  logInfo(...args: unknown[]): void {
    if (SHOW_ALL_LOGS_IN_TESTS) {
      console.info(inspect(args, undefined, 30));
    }
  }
  logWarning(...args: unknown[]): void {
    console.warn(inspect(args, undefined, 30));

    /*
      Test should fail if a warning occurs inside the request-response flow
    */
    throw new Error();
  }
  logError(key: string, caughtValue: unknown, extraData?: unknown): void {
    this._onlyLogErrorToConsole(key, caughtValue, extraData);
  }
  _onlyLogErrorToConsole(
    key: string,
    caughtValue: unknown,
    extraData?: unknown,
  ): void {
    console.error(inspect([key, caughtValue, extraData], undefined, 30));

    /*
      Test should fail if an error occurs inside the request-response flow
    */
    if (caughtValue instanceof Error) {
      throw caughtValue;
    } else {
      throw new Error();
    }
  }
}

export function createLoggingTestService(): LoggingTestService {
  return new LoggingTestService();
}
