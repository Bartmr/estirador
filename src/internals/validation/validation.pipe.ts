import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { throwError } from 'not-me/lib/utils/throw-error';
import {
  SupportedValidationSchema,
  VALIDATION_SCHEMA_KEY,
} from '@app/shared/internals/validation/validation-schema.decorator';

@Injectable()
export class AppValidationPipe implements PipeTransform<unknown> {
  constructor(private readonly reflector: Reflector) {}

  transform(incomingValue: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'custom') {
      return incomingValue;
    } else {
      const metatype =
        metadata.metatype ||
        throwError(
          'No metatype defined. You must use an ES6 class annotated with @ValidationSchema as argument type',
        );

      const schema =
        this.reflector.get<SupportedValidationSchema | undefined>(
          VALIDATION_SCHEMA_KEY,
          metatype,
        ) ||
        throwError(
          'Metatype ' +
            metatype.name +
            ' is not annotated with @ValidationSchema',
        );

      const result = schema.validate(incomingValue, {
        abortEarly: true,
      });

      if (result.errors) {
        throw new BadRequestException(result.messagesTree);
      } else {
        return result.value;
      }
    }
  }
}
