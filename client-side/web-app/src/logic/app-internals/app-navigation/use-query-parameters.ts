import { useEffect, useState } from 'react';
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
    | { isServerSide: true }
    | { isServerSide: false; invalid: true }
    | { isServerSide: false; invalid: false; data: Readonly<QueryParameters> }
  >;

  const [queryParameters, replaceQueryParameters] =
    useState<QueryParametersResult>({ isServerSide: true });

  const location = useLocation();

  const parse = (): QueryParametersResult => {
    const urlSearchParams = new URLSearchParams(location.search);

    const unparsedQueryParameters: { [key: string]: string } = {};

    urlSearchParams.forEach((value, key) => {
      unparsedQueryParameters[key] = value;
    });

    const result = schema.validate(unparsedQueryParameters);

    if (result.errors) {
      Logger.logDebug('use-query-parameters:invalid-params', { result });
      return {
        isServerSide: false,
        invalid: true,
      };
    } else {
      return {
        isServerSide: false,
        invalid: false,
        data: result.value as QueryParameters,
      };
    }
  };

  useEffect(() => {
    replaceQueryParameters(parse());
  }, [location.search, schema]);

  return queryParameters;
}
