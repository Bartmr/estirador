import { SerializableJSONValue } from '../transports/json-types';

type QueryParams = {
  [key: string]: undefined | SerializableJSONValue | SerializableJSONValue[];
};

export function toQueryString(queryParams: QueryParams) {
  const urlSearchParams = new URLSearchParams();

  let paramsCounter = 0;

  for (const key in queryParams) {
    const value = queryParams[key];

    if (typeof value !== 'undefined') {
      if (value instanceof Array) {
        for (const parameter of value) {
          const serializedParameter =
            typeof parameter === 'string'
              ? parameter
              : JSON.stringify(parameter);

          urlSearchParams.append(key, serializedParameter);
          paramsCounter += 1;
        }
      } else {
        const serializedValue =
          typeof value === 'string' ? value : JSON.stringify(value);

        urlSearchParams.append(key, serializedValue);
        paramsCounter += 1;
      }
    }
  }

  if (paramsCounter === 0) {
    return '';
  } else {
    return `?${urlSearchParams.toString()}`;
  }
}
