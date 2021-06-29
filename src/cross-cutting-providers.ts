import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './internals/error-handling/all-exceptions.filter';
import { AppInterceptor } from './internals/server/app.interceptor';
import { AppValidationPipe } from './internals/validation/validation.pipe';

export const CROSS_CUTTING_PROVIDERS = [
  {
    provide: APP_PIPE,
    useClass: AppValidationPipe,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: AppInterceptor,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
];
