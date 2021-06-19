import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { ServerResponse } from 'http';
import { map } from 'rxjs/operators';
import { stripNullValuesRecursively } from '../utils/strip-null-values-recursively';

@Injectable()
export class AppInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler<unknown>) {
    return next.handle().pipe(
      map((value) => {
        /*
          When using the @Response() decorator,
          NestJS will stop managing the response flow
          and leave everything up to you and the response object
        */
        if (value instanceof ServerResponse) {
          throw new Error(
            "Let NestJS continue to manage the response flow by using '@Response({ passthrough: true })' when getting the response object",
          );
        }

        // Do not strip top level null. Might be useful as a value
        if (value === null) {
          return value;
        }

        return stripNullValuesRecursively(value);
      }),
    );
  }
}
