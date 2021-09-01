import { useMemo } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { useParams } from '@reach/router';
import { useAppNavigation } from './use-app-navigation';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { RUNNING_IN_SERVER } from '../runtime/running-in';

type SupportedRouteParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

export function useRouteParameters<
  RouteParametersSchema extends SupportedRouteParametersSchema,
>(schema: RouteParametersSchema) {
  const unparsedParameters = useParams() as unknown;
  const appNavigation = useAppNavigation();

  type RouteParameters = InferType<RouteParametersSchema>;

  type RouteParametersResult = Readonly<
    | { isServerSide: true }
    | { isServerSide: false; invalid: true }
    | { isServerSide: false; invalid: false; data: Readonly<RouteParameters> }
  >;

  const parse = (): RouteParametersResult => {
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
        data: result.value as RouteParameters,
      };
    }
  };

  const routeParameters = useMemo((): RouteParametersResult => {
    if (RUNNING_IN_SERVER) {
      return { isServerSide: true };
    } else {
      return parse();
    }
  }, [appNavigation.currentHref, schema]);

  return routeParameters;
}
