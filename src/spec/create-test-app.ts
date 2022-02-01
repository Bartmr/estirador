import { LoggerService, ModuleMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CROSS_CUTTING_PROVIDERS } from 'src/cross-cutting-providers';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from 'src/internals/databases/default-db-typeorm-conn-opts';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { LoggingModule } from 'src/internals/logging/logging.module';
import { createLoggingTestService } from './logging-test-service';
import { TestApp } from './test-app-types';
import cookieParser from 'cookie-parser';
import { AuthModule } from 'src/auth/auth.module';

if (NODE_ENV !== NodeEnv.Test) {
  throw new Error();
}

const loggingTestService = createLoggingTestService();

const logger: LoggerService = {
  log(message: string) {
    loggingTestService.logInfo('nestjs-logger-log', message);
  },
  error(message: string, trace: string) {
    loggingTestService.logError('nestjs-logger-error', new Error(), {
      message,
      trace,
    });
  },
  warn(message: string) {
    loggingTestService.logWarning('nestjs-logger-warn', message);
  },
  debug(message: string) {
    loggingTestService.logDebug('nestjs-logger-debug', message);
  },
  verbose(message: string) {
    loggingTestService.logInfo('nestjs-logger-verbose', message);
  },
};

export async function createAndInitializeTestApp(args: {
  imports: NonNullable<ModuleMetadata['imports']>;
}): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      LoggingModule.forRoot(() => loggingTestService),
      TypeOrmModule.forRoot({
        ...DEFAULT_DB_TYPEORM_CONN_OPTS,
        autoLoadEntities: true,
      }),
      AuthModule,
      ...args.imports,
    ],
    providers: CROSS_CUTTING_PROVIDERS,
  }).compile();

  const app = moduleRef.createNestApplication();

  app.use(cookieParser());

  app.useLogger(logger);

  await app.init();

  return app;
}
