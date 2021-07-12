import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
  InternalServerErrorException,
} from '@nestjs/common';
import { AppServerRequest } from '../server/types/app-server-request-types';
import { LoggingService } from '../logging/logging.service';
import { AppServerResponse } from '../server/types/app-server-response-types';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';

const LOG_REQUEST_CONTENTS_ON_ERROR =
  EnvironmentVariablesService.variables.LOG_REQUEST_CONTENTS_ON_ERROR;

@Catch()
export class AllExceptionsFilter implements ExceptionFilter<unknown> {
  constructor(private loggingService: LoggingService) {}

  private logError(exception: unknown, request: AppServerRequest) {
    this.loggingService.logError('on-exception-request-logging', exception, {
      path: request.path,
      method: request.method,
      statusCode:
        exception instanceof HttpException ? exception.getStatus() : undefined,
      body: LOG_REQUEST_CONTENTS_ON_ERROR
        ? (request.body as unknown)
        : undefined,
    });
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<AppServerRequest>();
    const response = ctx.getResponse<AppServerResponse>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();

      if (statusCode >= 500) {
        this.logError(exception, request);
      } else {
        this.loggingService.logDebug('request-exception', {
          exception,
          request: {
            path: request.path,
            method: request.method,
            statusCode: statusCode,
            body: LOG_REQUEST_CONTENTS_ON_ERROR
              ? (request.body as unknown)
              : undefined,
          },
        });
      }

      response.status(statusCode).json(exception.getResponse());
    } else {
      this.logError(exception, request);

      const internalErrorException = new InternalServerErrorException();

      response
        .status(internalErrorException.getStatus())
        .json(internalErrorException.getResponse());
    }
  }
}
