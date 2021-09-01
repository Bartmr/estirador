import { useMemo } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { useLocation } from '@reach/router';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';

type SupportedQueryParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

export function useQueryParameters<
  QueryParametersSchema extends SupportedQueryParametersSchema,
>(schema: QueryParametersSchema) {
  type QueryParameters = InferType<QueryParametersSchema>;

  type QueryParametersResult = Readonly<
    { invalid: true } | { invalid: false; data: Readonly<QueryParameters> }
  >;

  const location = useLocation();

  const queryParameters = useMemo((): QueryParametersResult => {
    const urlSearchParams = new URLSearchParams(location.search);

    const unparsedQueryParameters: { [key: string]: string } = {};

    urlSearchParams.forEach((value, key) => {
      unparsedQueryParameters[key] = value;
    });

    const result = schema.validate(unparsedQueryParameters);

    if (result.errors) {
      Logger.logDebug('use-query-parameters:invalid-params', { result });
      return {
        invalid: true,
      };
    } else {
      return {
        invalid: false,
        data: result.value as QueryParameters,
      };
    }
  }, [location.search, schema]);

  return queryParameters;
}
