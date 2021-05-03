import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { NotMeValidationPipe } from 'not-me/lib/resolvers/nest/validation.pipe';
import { AllExceptionsFilter } from './internals/error-handling/all-exceptions.filter';
import { AppInterceptor } from './internals/server/app.interceptor';

export const CROSS_CUTTING_PROVIDERS = [
  {
    provide: APP_PIPE,
    useClass: NotMeValidationPipe,
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
