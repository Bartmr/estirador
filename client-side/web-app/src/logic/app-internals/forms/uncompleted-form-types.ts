type FormField<T> =
  | T
  /*
    Covers:
      - Some libraries set form fields as null in order to clear the input
      or represent an empty value
  */
  | null
  /*
    Covers:
      - dropdowns when an empty value is selected (empty string)
      - unparsable text values (like alphanumeric text in numeric inputs) awaiting user correction
      - pending text values that are validated only when the input loses focus
      - dates from <input type="date" /> or <input type="datetime-local" />,
      where values are read as strings by default in some form libraries
  */
  | string;

export type UncompletedFormValue<T, IsRootOfForm extends boolean = false> =
  | (IsRootOfForm extends true ? never : undefined)
  | (T extends Array<unknown>
      ? Array<UncompletedFormValue<T[number]>>
      : T extends { [key: string]: unknown }
      ? { [K in keyof T]: UncompletedFormValue<T[K]> }
      : FormField<T>);
