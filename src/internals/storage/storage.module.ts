import { MiddlewareConsumer, Module } from '@nestjs/common';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { LOCAL_TEMPORARY_FILES_PATH } from '../local-temporary-files/local-temporary-files-path';
import express from 'express';
import path from 'path';
import { StorageService } from './storage.service';
import { DevStorageService } from './dev-storage.service';
import { throwError } from 'libs/shared/src/internals/utils/throw-error';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);

export const USE_DEV_STORAGE =
  NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test;

@Module({
  providers: [
    {
      provide: StorageService,
      useClass: USE_DEV_STORAGE
        ? DevStorageService
        : throwError('Not Implemented'),
    },
  ],
  exports: [StorageService],
})
export class StorageModule {
  async configure(consumer: MiddlewareConsumer) {
    if (USE_DEV_STORAGE) {
      await mkdir(path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage'), {
        recursive: true,
      });

      consumer
        .apply(
          express.static(path.join(LOCAL_TEMPORARY_FILES_PATH, 'storage'), {
            setHeaders: (res) => {
              res.setHeader('Content-Disposition', 'attachment');
            },
          }),
        )
        .forRoutes('/tmp/storage');
    }
  }
}
