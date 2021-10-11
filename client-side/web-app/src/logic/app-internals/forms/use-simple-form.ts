import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { useState } from 'react';
import { DeepPartial } from 'redux';

type FormValueBase = { [key: string]: unknown };

export type UncompletedSimpleFormValue<T> = T extends Array<unknown>
  ? Array<DeepPartial<T[number]>>
  : T extends { [key: string]: unknown }
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T | undefined;

type FieldUtils<FormValue extends FormValueBase> = {
  setValue: <Name extends keyof FormValue>(
    name: Name,
    value: UncompletedSimpleFormValue<FormValue[Name]>,
  ) => void;
  hasErrors: (name: keyof FormValue) => boolean;
  getErrors: (name: keyof FormValue) => { [key: string]: string };
  isDirty: (name: keyof FormValue) => boolean;
};

export type SimpleForm<FormValue extends FormValueBase> = {
  values: UncompletedSimpleFormValue<FormValue>;
  field: FieldUtils<FormValue>;
  reset: (defaultValues?: UncompletedSimpleFormValue<FormValue>) => void;
  getFinalValue(): { invalid: true } | { invalid: false; data: FormValue };
  formIsValid: boolean;
  finalValueWasRequested: boolean;
};

export function useSimpleForm<
  S extends Schema<FormValueBase>,
  FormValue extends FormValueBase = InferType<S>,
>(args: {
  schema: S;
  defaultValues?: UncompletedSimpleFormValue<FormValue>;
}): SimpleForm<FormValue> {
  /*
   */
  const [values, replaceValues] = useState<
    UncompletedSimpleFormValue<FormValue>
  >(args.defaultValues || ({} as UncompletedSimpleFormValue<FormValue>));
  /*
   */
  const [visibleErrors, replaceVisibleErrors] = useState<
    { [K in keyof FormValue]?: { [key: string]: string } }
  >({});
  /*
   */
  const [totalErrors, replaceTotalErrors] = useState<{
    [key: string]: AnyErrorMessagesTree;
  }>({});
  /*
   */
  const [dirtyFields, replaceDirtyFields] = useState<
    { [K in keyof FormValue]?: boolean }
  >({});
  /*
   */
  const [finalValueWasRequested, replaceFinalValueWasRequested] =
    useState(false);
  /*
   */

  const fieldUtils: FieldUtils<FormValue> = {
    hasErrors: (name) => !!visibleErrors[name],
    getErrors: (name) => visibleErrors[name] || {},
    setValue: (name, value) => {
      if (!dirtyFields[name]) {
        replaceDirtyFields((oldDirtyFields) => ({
          ...oldDirtyFields,
          [name]: true,
        }));
      }

      const validationResult = args.schema.validate(value);

      if (validationResult.errors) {
        const messagesTree = validationResult.messagesTree;

        const formMessagesTree = messagesTree[0];

        if (typeof formMessagesTree === 'object') {
          replaceTotalErrors(formMessagesTree);

          const fieldErrors = formMessagesTree[name as string];

          if (fieldErrors) {
            replaceVisibleErrors((e) => ({
              ...e,
              [name]: fieldErrors
                .filter((c): c is string => typeof c === 'string')
                .reduce<{ [key: string]: string }>((acc, fieldError) => {
                  acc[fieldError] = fieldError;

                  return acc;
                }, {}),
            }));
          }
        } else {
          throw new Error(
            "Cannot have form errors coming from the form root object. Only it's fields.",
          );
        }
      }

      replaceValues((oldValues) => ({ ...oldValues, [name]: value }));
    },
    isDirty: (name) => !!dirtyFields[name],
  };

  return {
    values,
    field: fieldUtils,
    reset: (defaultValues) => {
      replaceValues(
        defaultValues || ({} as UncompletedSimpleFormValue<FormValue>),
      );
      replaceVisibleErrors({});
      replaceTotalErrors({});
    },
    getFinalValue: () => {
      replaceFinalValueWasRequested(true);

      const validationResult = args.schema.validate(values);

      if (validationResult.errors) {
        const formMessagesTree = validationResult.messagesTree[0];

        if (typeof formMessagesTree === 'object') {
          replaceTotalErrors(formMessagesTree);

          replaceVisibleErrors(
            Object.keys(formMessagesTree).reduce<
              { [K in keyof FormValue]?: { [key: string]: string } }
            >((formErrors, _key) => {
              const key = _key as keyof FormValue;

              const fieldMesssagesTree = formMessagesTree[key as string];

              if (fieldMesssagesTree) {
                formErrors[key] = fieldMesssagesTree
                  .filter((c): c is string => typeof c === 'string')
                  .reduce<{ [key: string]: string }>((fieldErrors, message) => {
                    fieldErrors[message] = message;
                    return fieldErrors;
                  }, {});
              }

              return formErrors;
            }, {}),
          );

          return {
            invalid: true,
          };
        } else {
          throw new Error(
            "Cannot have form errors coming from the form root object. Only it's fields.",
          );
        }
      } else {
        replaceVisibleErrors({});
        replaceTotalErrors({});

        return {
          invalid: false,
          data: validationResult.value as FormValue,
        };
      }
    },
    formIsValid: Object.keys(totalErrors).length === 0,
    finalValueWasRequested,
  };
}
