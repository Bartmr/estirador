import { EnumBase } from './enum-types';

export function getEnumValues<T extends EnumBase>(
  inputedEnum: T,
): Array<T[keyof T]> {
  return Object.keys(inputedEnum)
    .filter((k) => {
      const firstChar = k[0];

      if (!firstChar) {
        return false;
      }

      // Only pick the enum's named keys
      return !(firstChar >= '0' && firstChar <= '9');
    })
    .map((k) => inputedEnum[k as keyof T]);
}
