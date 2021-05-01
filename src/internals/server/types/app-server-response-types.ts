import { Response } from 'express';

export type AppServerResponse<T = unknown> = Response<T>;
