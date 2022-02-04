import { DynamicModule } from '@nestjs/common';
import { LoggingService } from './logging.service';

export class LoggingModule {
  static forRoot(getLoggingService: () => LoggingService): DynamicModule {
    return {
      global: true,
      module: LoggingModule,
      providers: [
        {
          provide: LoggingService,
          useFactory: getLoggingService,
        },
      ],
      exports: [LoggingService],
    };
  }
}
