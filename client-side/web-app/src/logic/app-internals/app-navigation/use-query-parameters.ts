import { useMemo } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { useRouter } from 'next/router';

type SupportedQueryParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

export function useQueryParameters<
  QueryParametersSchema extends SupportedQueryParametersSchema,
>(schema: QueryParametersSchema) {
  type QueryParameters = InferType<QueryParametersSchema>;

  type QueryParametersResult = Readonly<
    | { invalid: true }
    | { invalid: false; queryParameters: Readonly<QueryParameters> }
  >;

  const router = useRouter();

  const queryParameters = useMemo((): QueryParametersResult => {
    const split = router.asPath.split('?');

    const urlSearchParams = new URLSearchParams(`?${split[1] || ''}`);

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
        queryParameters: result.value as QueryParameters,
      };
    }
  }, [router.asPath, schema]);

  return queryParameters;
}
