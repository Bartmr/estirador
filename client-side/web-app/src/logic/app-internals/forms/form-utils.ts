import {
  FieldError,
  FieldPath,
  UseFormReturn,
  ValidateResult,
} from 'react-hook-form';
import get from 'lodash/get';

type FormValueBase = {};

type FormUtils<FormValue extends FormValueBase> = {
  getErrorTypesFromField: (path: FieldPath<FormValue>) => {
    [key: string]: ValidateResult;
  };
  hasErrors: (path: FieldPath<FormValue>) => boolean;
};

export function useFormUtils<FormValue extends FormValueBase>(
  form: UseFormReturn<FormValue>,
) {
  const formUtils: FormUtils<FormValue> = {
    getErrorTypesFromField: (path) => {
      const errorInField = get(form.formState.errors, path) as
        | { [key: string]: unknown }
        | FieldError
        | undefined;

      if (!errorInField) {
        return {};
      } else if (typeof errorInField.type === 'string') {
        return (errorInField as FieldError).types || {};
      } else {
        return {};
      }
    },
    hasErrors: (path) => {
      return Object.keys(formUtils.getErrorTypesFromField(path)).length > 0;
    },
  };

  return formUtils;
}
