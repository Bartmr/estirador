import { throwError } from '@app/shared/internals/utils/throw-error';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NODE_ENV } from '../environment/node-env.constants';
import { NodeEnv } from '../environment/node-env.types';
import { DevEmailService } from './dev/dev-email.service';
import { EmailService } from './email.service';
import express from 'express';
import { resolveLocalTemporaryFilesPath } from '../local-temporary-files/local-temporary-files-path';

export const USE_DEV_EMAIL =
  NODE_ENV === NodeEnv.Development || NODE_ENV === NodeEnv.Test;

@Module({
  providers: [
    USE_DEV_EMAIL
      ? {
          provide: EmailService,
          useClass: DevEmailService,
        }
      : throwError('Not Implemented'),
  ],
  exports: [EmailService],
})
export class EmailModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(express.static(resolveLocalTemporaryFilesPath('dev-email')))
      .forRoutes('/tmp/dev-email');
  }
}
