import { useEffect, useState } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { useRouter } from 'next/router';

type SupportedQueryParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

type QueryParameters<
  QueryParametersSchema extends SupportedQueryParametersSchema,
> =
  | { isServerSide: true }
  | { isServerSide: false; invalid: true }
  | {
      isServerSide: false;
      invalid: false;
      data: InferType<QueryParametersSchema>;
    };

function parse<QueryParametersSchema extends SupportedQueryParametersSchema>(
  schema: QueryParametersSchema,
  location: Location,
): QueryParameters<QueryParametersSchema> {
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
      data: result.value,
    };
  }
}

export function useQueryParameters<
  QueryParametersSchema extends SupportedQueryParametersSchema,
>(schema: QueryParametersSchema) {
  const [queryParameters, replaceQueryParameters] = useState<
    QueryParameters<QueryParametersSchema>
  >({ isServerSide: true });

  const router = useRouter();

  useEffect(() => {
    const newQueryParameters = parse(schema, location);

    if (
      JSON.stringify(newQueryParameters) !== JSON.stringify(queryParameters)
    ) {
      replaceQueryParameters(newQueryParameters);
    }
  }, [router.asPath]);

  return queryParameters;
}
