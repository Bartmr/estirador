export function stripNullValuesRecursively(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripNullValuesRecursively);
  } else if (typeof value === 'object' && value !== null) {
    const _value = value as { [key: string]: unknown };

    Object.keys(_value).forEach((key) => {
      _value[key] = stripNullValuesRecursively(_value[key]);
    });

    return _value;
  } else if (value === null) {
    return undefined;
  } else {
    return value;
  }
}
