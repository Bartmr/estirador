import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './internals/error-handling/all-exceptions.filter';
import { AppValidationPipe } from './internals/validation/validation.pipe';

export const CROSS_CUTTING_PROVIDERS = [
  {
    provide: APP_PIPE,
    useClass: AppValidationPipe,
  },
  {
    provide: APP_FILTER,
    useClass: AllExceptionsFilter,
  },
];
