import { useEffect, useState } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { useParams, useLocation } from '@reach/router';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';

type SupportedRouteParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

type RouteParameters<
  RouteParametersSchema extends SupportedRouteParametersSchema,
> =
  | { isServerSide: true }
  | { isServerSide: false; invalid: true }
  | {
      isServerSide: false;
      invalid: false;
      data: InferType<RouteParametersSchema>;
    };

function parse<RouteParametersSchema extends SupportedRouteParametersSchema>(
  schema: RouteParametersSchema,
  unparsedParameters: unknown,
): RouteParameters<RouteParametersSchema> {
  const result = schema.validate(unparsedParameters || {});

  if (result.errors) {
    Logger.logDebug('use-route-parameters:invalid-params', { result });
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

export function useRouteParameters<
  RouteParametersSchema extends SupportedRouteParametersSchema,
>(schema: RouteParametersSchema) {
  const [routeParameters, replaceRouteParameters] = useState<
    RouteParameters<RouteParametersSchema>
  >({ isServerSide: true });

  const unparsedParameters = useParams() as unknown;
  const location = useLocation();

  useEffect(() => {
    const newRouteParameters = parse(schema, unparsedParameters);

    if (
      JSON.stringify(newRouteParameters) !== JSON.stringify(routeParameters)
    ) {
      replaceRouteParameters(newRouteParameters);
    }
  }, [location.pathname]);

  return routeParameters;
}
