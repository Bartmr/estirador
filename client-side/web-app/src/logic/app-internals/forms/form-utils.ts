import { FieldError, FieldPath, UseFormReturn } from 'react-hook-form';
import get from 'lodash/get';

type FormValueBase = {};

type FormUtils<FormValue extends FormValueBase> = {
  getErrorFromField: (path: FieldPath<FormValue>) => FieldError | undefined;
};

export function useFormUtils<FormValue extends FormValueBase>(
  form: UseFormReturn<FormValue>,
) {
  const formUtils: FormUtils<FormValue> = {
    getErrorFromField: (path) => {
      const errorInField = get(form.formState.errors, path) as
        | { [key: string]: unknown }
        | FieldError
        | undefined;

      if (!errorInField) {
        return undefined;
      } else if (typeof errorInField.type === 'string') {
        return errorInField as FieldError;
      } else {
        return undefined;
      }
    },
  };

  return formUtils;
}
