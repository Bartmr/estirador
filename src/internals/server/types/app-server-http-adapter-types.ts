import http from 'http';
import { Application } from 'express';
import { AbstractHttpAdapter } from '@nestjs/core';
import { AppServerRequest } from './app-server-request-types';
import { AppServerResponse } from './app-server-response-types';

export type AppServerHttpAdapterInstance = Application;
export type AppServerHttpServer = http.Server;

abstract class AppServerHttpAdapterBase extends AbstractHttpAdapter<
  http.Server,
  AppServerRequest,
  AppServerResponse
> {
  protected instance!: Application;
  protected httpServer!: http.Server;

  abstract getHttpServer(): http.Server;
  abstract getInstance<T = AppServerHttpAdapterInstance>(): T;
}

export type AppServerHttpAdapter = AppServerHttpAdapterBase;
