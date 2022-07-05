import { AnyErrorMessagesTree } from 'not-me/lib/error-messages/error-messages-tree';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { useState } from 'react';

type FormValueBase = { [key: string]: unknown };

export type UncompletedSimpleFormValue<FormValue extends FormValueBase> = {
  [K in keyof FormValue]?: FormValue[K];
};

type FieldUtils<FormValue extends FormValueBase> = {
  setValue: <Name extends keyof FormValue>(
    name: Name,
    value: FormValue[Name] | undefined,
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
};

export function useSimpleForm<
  S extends Schema<FormValueBase>,
  FormValue extends FormValueBase = InferType<S>,
>(args: {
  schema: S;
  defaultValues?: UncompletedSimpleFormValue<FormValue>;
  debounceMilliseconds?: number;
}): SimpleForm<FormValue> {
  /*
   */
  const [values, replaceValues] = useState<
    UncompletedSimpleFormValue<FormValue>
  >(args.defaultValues || {});
  /*
   */
  const [visibleErrors, replaceVisibleErrors] = useState<{
    [K in keyof FormValue]?: { [key: string]: string };
  }>({});
  /*
   */
  const [totalErrors, replaceTotalErrors] = useState<{
    [key: string]: AnyErrorMessagesTree;
  }>({});
  /*
   */
  const [dirtyFields, replaceDirtyFields] = useState<{
    [K in keyof FormValue]?: boolean;
  }>({});
  /*
   */
  const [debounceTimeout, replaceDebounceTimeout] = useState<
    number | undefined
  >();
  /*
   */

  const fieldUtils: FieldUtils<FormValue> = {
    hasErrors: (name) => !!visibleErrors[name],
    getErrors: (name) => visibleErrors[name] || {},
    setValue: (name, fieldInput) => {
      if (!dirtyFields[name]) {
        replaceDirtyFields((oldDirtyFields) => ({
          ...oldDirtyFields,
          [name]: true,
        }));
      }

      replaceValues((oldValues) => {
        const newValues = { ...oldValues, [name]: fieldInput };

        const validate = () => {
          const validationResult = args.schema.validate(newValues);

          if (validationResult.errors) {
            const messagesTree = validationResult.messagesTree;

            const formMessagesTree = messagesTree[0];

            if (typeof formMessagesTree === 'object') {
              replaceTotalErrors(formMessagesTree);

              replaceVisibleErrors(
                Object.keys(formMessagesTree).reduce<{
                  [K in keyof FormValue]?: { [key: string]: string };
                }>((formErrors, _key) => {
                  const key = _key as keyof FormValue;

                  const fieldMesssagesTree = formMessagesTree[key as string];

                  if (
                    fieldMesssagesTree &&
                    (key === name || dirtyFields[key])
                  ) {
                    formErrors[key] = fieldMesssagesTree
                      .filter((c): c is string => typeof c === 'string')
                      .reduce<{ [key: string]: string }>(
                        (fieldErrors, message) => {
                          fieldErrors[message] = message;
                          return fieldErrors;
                        },
                        {},
                      );
                  }

                  return formErrors;
                }, {}),
              );
            } else {
              throw new Error(
                "Cannot have form errors coming from the form root object. Only it's fields.",
              );
            }
          } else {
            replaceVisibleErrors({});
            replaceTotalErrors({});
          }
        };

        if (args.debounceMilliseconds != null) {
          if (debounceTimeout != null) {
            window.clearTimeout(debounceTimeout);
          }

          const newDebouceTimeout = window.setTimeout(
            validate,
            args.debounceMilliseconds,
          );
          replaceDebounceTimeout(newDebouceTimeout);
        } else {
          validate();
        }

        return newValues;
      });
    },
    isDirty: (name) => !!dirtyFields[name],
  };

  return {
    values,
    field: fieldUtils,
    reset: (defaultValues) => {
      if (debounceTimeout != null) {
        window.clearTimeout(debounceTimeout);
      }

      replaceDebounceTimeout(undefined);
      replaceValues(defaultValues || {});
      replaceVisibleErrors({});
      replaceTotalErrors({});
      replaceDirtyFields({});
    },
    getFinalValue: () => {
      const validationResult = args.schema.validate(values);

      if (validationResult.errors) {
        const formMessagesTree = validationResult.messagesTree[0];

        if (typeof formMessagesTree === 'object') {
          replaceTotalErrors(formMessagesTree);

          replaceVisibleErrors(
            Object.keys(formMessagesTree).reduce<{
              [K in keyof FormValue]?: { [key: string]: string };
            }>((formErrors, _key) => {
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
  };
}
