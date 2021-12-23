import { throwError } from 'libs/shared/src/internals/utils/throw-error';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { DevEmailService } from './dev/dev-email.service';
import { EmailService } from './email.service';
import express from 'express';
import path from 'path';
import { LOCAL_TEMPORARY_FILES_PATH } from '../local-temporary-files/local-temporary-files-path';
import fs from 'fs';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);

export const USE_DEV_EMAIL =
  NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test;

@Module({
  providers: [
    {
      provide: EmailService,
      useClass: USE_DEV_EMAIL ? DevEmailService : throwError('Not Implemented'),
    },
  ],
  exports: [EmailService],
})
export class EmailModule implements NestModule {
  async configure(consumer: MiddlewareConsumer) {
    if (USE_DEV_EMAIL) {
      await mkdir(path.join(LOCAL_TEMPORARY_FILES_PATH, 'dev-email'), {
        recursive: true,
      });

      consumer
        .apply(
          express.static(path.join(LOCAL_TEMPORARY_FILES_PATH, 'dev-email')),
        )
        .forRoutes('/tmp/dev-email');
    }
  }
}
