/* eslint-disable no-console */
import { EnvironmentVariables } from '../runtime/environment-variables';
import { RUNNING_IN_SERVER } from '../runtime/running-in';

const LOG_ENTRIES_LIMIT = 3;

class LoggerImpl {
  private loggedErrors: { [key: string]: undefined | number } = {};
  private loggedWarnings: { [key: string]: undefined | number } = {};
  private loggedDebug: { [key: string]: undefined | number } = {};

  logDebug(key: string, extraData?: unknown) {
    if (EnvironmentVariables.LOG_DEBUG) {
      const numberOfTimesLogged = this.loggedDebug[key] || 0;

      if (
        EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
        numberOfTimesLogged < LOG_ENTRIES_LIMIT
      ) {
        this.loggedDebug[key] = numberOfTimesLogged + 1;

        // TODO: Implement remote logging here

        /*
          Some remote loggers also capture console messages.
          Maybe it's best to just call either the remote logger or the console,
          and not both, so we don't get twice the events.
        */

        console.log('----- DEBUG: ' + key, '\nExtra data:', extraData);
      }
    }
  }

  logWarning(key: string, message: string, extraData?: unknown) {
    const numberOfTimesLogged = this.loggedWarnings[key] || 0;

    if (
      EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
      numberOfTimesLogged < LOG_ENTRIES_LIMIT
    ) {
      this.loggedWarnings[key] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here

      /*
        Some remote loggers also capture console messages.
        Maybe it's best to just call either the remote logger or the console,
        and not both, so we don't get twice the events.
      */

      console.warn('Logged warning with key: ' + key + '. ' + message);
      console.warn('Extra data:', extraData);
    }
  }

  logError(
    errorKey: string,
    /*
      In Javascript, any value type can be thrown,
      so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ) {
    const caughtValueIsInstanceOfError = caughtValue instanceof Error;
    const error = caughtValueIsInstanceOfError ? caughtValue : new Error();

    // Stop building pages if one of them has an error
    if (RUNNING_IN_SERVER) {
      this.logErrorToConsole(
        errorKey,
        caughtValue,
        error,
        caughtValueIsInstanceOfError,
        extraData,
      );

      throw caughtValue;
    }

    const numberOfTimesLogged = this.loggedErrors[errorKey] || 0;

    if (
      EnvironmentVariables.DISABLE_LOGGING_LIMIT ||
      numberOfTimesLogged < LOG_ENTRIES_LIMIT
    ) {
      this.loggedErrors[errorKey] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here

      /*
        Some remote loggers also capture console messages.
        Maybe it's best to just call either the remote logger or the console,
        and not both, so we don't get twice the events.
      */

      this.logErrorToConsole(
        errorKey,
        caughtValue,
        error,
        caughtValueIsInstanceOfError,
        extraData,
      );
    }
  }

  private logErrorToConsole(
    errorKey: string,
    caughtValue: unknown,
    error: unknown,
    caughtValueIsInstanceOfError: boolean,
    extraData: unknown,
  ) {
    console.error('Logged error with key: ' + errorKey);

    if (!caughtValueIsInstanceOfError) {
      console.error('Caught value is not an instance of Error:', caughtValue);
    }

    console.error(error);

    if (typeof extraData !== 'undefined') {
      console.error('Error extra data:', extraData);
    }
  }
}

const Logger = new LoggerImpl();

export { Logger };
