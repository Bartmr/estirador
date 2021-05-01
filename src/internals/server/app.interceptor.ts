import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import { stripNullValuesRecursively } from '../utils/strip-null-values-recursively';

@Injectable()
export class AppInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<unknown>) {
    return next.handle().pipe(
      map((value) => {
        // Do not strip top level null. Might be useful as a value
        if (value === null) {
          return value;
        }

        return stripNullValuesRecursively(value);
      }),
    );
  }
}
