import { throwError } from '@app/shared/internals/utils/throw-error';
import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { FieldError, FieldErrors, ResolverResult } from 'react-hook-form';

type FormValueBase = {};

type ErrorMessagesTreeObject = { [key: string]: AnyErrorMessagesTree };

export function notMeReactHookFormResolver<S extends Schema<FormValueBase>>(
  schema: S,
) {
  return (data: unknown): ResolverResult<InferType<S>> => {
    const validationResult = schema.validate(data);

    const parseMessagesTreeObject = (obj: ErrorMessagesTreeObject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: FieldErrors<any> = {};

      for (const key of Object.keys(obj)) {
        const notMeFieldErrors = obj[key];

        if (!notMeFieldErrors) continue;

        const objectMessagesTree = notMeFieldErrors.find(
          (c): c is ErrorMessagesTreeObject => typeof c === 'object',
        );

        if (objectMessagesTree) {
          errors[key] = parseMessagesTreeObject(objectMessagesTree);
        } else {
          errors[key] = notMeFieldErrors
            .filter((c): c is string => typeof c === 'string')
            .reduce<FieldError>(
              (acc, c) => {
                const types = acc.types || throwError();

                types[c] = c;

                return acc;
              },
              { type: 'validate', types: {} },
            );
        }
      }

      return errors;
    };

    if (validationResult.errors) {
      const messagesTree = validationResult.messagesTree;

      if (typeof messagesTree[0] === 'object') {
        return {
          values: {},
          errors: parseMessagesTreeObject(messagesTree[0]),
        };
      } else {
        throw new Error(
          "Cannot have form errors coming from the form root object. Only it's fields.",
        );
      }
    } else {
      return {
        values: validationResult.value,
        errors: {},
      };
    }
  };
}
