import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingService } from './internals/logging/logging.service';
import { LoggerService } from '@nestjs/common';
import { NODE_ENV } from './internals/environment/node-env.constants';
import { NodeEnv } from './internals/environment/node-env.types';
import { EnvironmentVariablesService } from './internals/environment/environment-variables.service';
import { PROJECT_NAME } from '@app/shared/project-details';

if (NODE_ENV === NodeEnv.Test) {
  throw new Error(`createApp() is not meant to create an app for testing purposes.
Use createTestApp() instead, inside ./spec/`);
}

const WEB_APP_ORIGIN = EnvironmentVariablesService.variables.WEB_APP_ORIGIN;

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: WEB_APP_ORIGIN,
  });

  const loggingService = app.get(LoggingService);

  const logger: LoggerService = {
    log(message: string) {
      loggingService.logInfo('nestjs-logger-log', message);
    },
    error(message: string, trace: string) {
      loggingService.logError('nestjs-logger-error', new Error(), {
        message,
        trace,
      });
    },
    warn(message: string) {
      loggingService.logWarning('nestjs-logger-warn', message);
    },
    debug(message: string) {
      loggingService.logDebug('nestjs-logger-debug', message);
    },
    verbose(message: string) {
      loggingService.logInfo('nestjs-logger-verbose', message);
    },
  };

  app.useLogger(logger);

  if (EnvironmentVariablesService.variables.ENABLE_SWAGGER) {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger');

    const options = new DocumentBuilder()
      .setTitle(PROJECT_NAME + ' API')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      })
      .build();

    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup('api-docs', app, document);
  }

  return app;
}
