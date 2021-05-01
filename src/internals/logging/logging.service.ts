export abstract class LoggingService {
  abstract logDebug(key: string, extraData?: unknown): void;

  abstract logInfo(key: string, message: string, extraData?: unknown): void;

  abstract logWarning(key: string, message: string, extraData?: unknown): void;

  abstract logError(
    key: string,
    /*
        In Javascript, any value type can be thrown,
        so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ): void;

  abstract _onlyLogErrorToConsole(
    key: string,
    /*
        In Javascript, any value type can be thrown,
        so we don't know if a caught value is actually an Error instance.
    */
    caughtValue: unknown,
    extraData?: unknown,
  ): void;
}
