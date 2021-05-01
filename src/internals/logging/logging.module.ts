import { DynamicModule } from '@nestjs/common';
import { LoggingService } from './logging.service';

export class LoggingModule {
  static forRoot(loggingService: LoggingService): DynamicModule {
    return {
      global: true,
      module: LoggingModule,
      providers: [
        {
          provide: LoggingService,
          useValue: loggingService,
        },
      ],
      exports: [LoggingService],
    };
  }
}
