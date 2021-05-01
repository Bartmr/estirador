/* eslint-disable no-console */
import { COMMON_CONFIG } from '@config/common-config';
import {
  isRunningOnClient,
  isRunningOnServer,
} from '../runtime/is-running-on-server';

const LOG_LIMIT_PER_ERROR_TYPE = 3;

class LoggerImpl {
  private loggedErrors: { [key: string]: undefined | number } = {};

  logDebug(key: string, extraData?: unknown) {
    if (COMMON_CONFIG.logDebug) {
      console.log('----- DEBUG: ' + key, '\nExtra data:', extraData);
    }
  }

  logWarning(key: string, message: string, extraData?: unknown) {
    this.logWarningToConsole(key, message, extraData);
  }

  private logWarningToConsole(
    key: string,
    message: string,
    extraData?: unknown,
  ) {
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
    const error = caughtValueIsInstanceOfError
      ? (caughtValue as Error)
      : new Error();

    const numberOfTimesLogged = this.loggedErrors[errorKey] || 0;

    if (numberOfTimesLogged < LOG_LIMIT_PER_ERROR_TYPE) {
      this.loggedErrors[errorKey] = numberOfTimesLogged + 1;
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
    if (isRunningOnServer()) {
      throw caughtValue;
    }
  }
}

const Logger = new LoggerImpl();

if (isRunningOnClient()) {
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
