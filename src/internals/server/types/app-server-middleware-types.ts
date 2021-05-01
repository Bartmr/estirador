import { NestMiddleware } from '@nestjs/common';
import { AppServerRequest } from './app-server-request-types';
import { AppServerResponse } from './app-server-response-types';

export interface AppServerMiddleware extends NestMiddleware {
  use(
    req: AppServerRequest,
    res: AppServerResponse,
    next: (err?: unknown) => void,
  ): void | Promise<void>;
}
