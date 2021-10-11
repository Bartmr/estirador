/* eslint-disable no-console */
import { EnvironmentVariables } from '../runtime/environment-variables';
import { RUNNING_IN_CLIENT, RUNNING_IN_SERVER } from '../runtime/running-in';

const LOG_ENTRIES_LIMIT = 3;

class LoggerImpl {
  private loggedErrors: { [key: string]: undefined | number } = {};
  private loggedWarnings: { [key: string]: undefined | number } = {};

  logDebug(key: string, extraData?: unknown) {
    if (EnvironmentVariables.LOG_DEBUG) {
      console.log('----- DEBUG: ' + key, '\nExtra data:', extraData);
    }
  }

  logWarning(key: string, message: string, extraData?: unknown) {
    const numberOfTimesLogged = this.loggedWarnings[key] || 0;

    if (numberOfTimesLogged < LOG_ENTRIES_LIMIT) {
      this.loggedWarnings[key] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here
    }

    console.warn('Logged warning with key: ' + key + '. ' + message);
    console.warn('Extra data:', extraData);
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

    const numberOfTimesLogged = this.loggedErrors[errorKey] || 0;

    if (numberOfTimesLogged < LOG_ENTRIES_LIMIT) {
      this.loggedErrors[errorKey] = numberOfTimesLogged + 1;

      // TODO: Implement remote logging here
    }

    console.error('Logged error with key: ' + errorKey);

    if (!caughtValueIsInstanceOfError) {
      console.error('Caught value is not an instance of Error:', caughtValue);
    }

    console.error(error);

    if (typeof extraData !== 'undefined') {
      console.error('Error extra data:', extraData);
    }

    // Stop building pages if one of them has an error
    if (RUNNING_IN_SERVER) {
      throw caughtValue;
    }
  }
}

const Logger = new LoggerImpl();

if (RUNNING_IN_CLIENT) {
  /*
    Wrap in IIFE to avoid crashing due to unexisting `window` variable
  */
  (() => {
    const unhandledPromiseRejectionHandler = (event: PromiseRejectionEvent) => {
      /*
        The logging provider library problably has another event listener
        that will do the remote reporting.

        We just want the error to be printed on the console too.
      */
      console.error('unhandled-promise-rejection', event.reason, undefined);
    };

    const uncaughtExceptionHandler = (event: ErrorEvent) => {
      /*
        The logging provider library problably has another event listener
        that will do the remote reporting.

        We just want the error to be printed on the console too.
      */
      console.error('uncaught-error', event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    };

    window.addEventListener(
      'unhandledrejection',
      unhandledPromiseRejectionHandler,
    );
    window.addEventListener('error', uncaughtExceptionHandler);
  })();
}

export { Logger };
