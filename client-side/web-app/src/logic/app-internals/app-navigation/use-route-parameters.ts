import { useMemo } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { useAppNavigation } from './use-app-navigation';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';
import { useRouter } from 'next/router';

type SupportedRouteParametersSchema = Schema<{
  [key: string]: SerializableJSONValue | undefined;
}>;

export function useRouteParameters<
  RouteParametersSchema extends SupportedRouteParametersSchema,
>(schema: RouteParametersSchema) {
  const router = useRouter();

  const appNavigation = useAppNavigation();

  type RouteParameters = InferType<RouteParametersSchema>;

  type RouteParametersResult = Readonly<
    { invalid: true } | { invalid: false; data: Readonly<RouteParameters> }
  >;

  const routeParameters = useMemo((): RouteParametersResult => {
    const result = schema.validate(router.query);

    if (result.errors) {
      Logger.logDebug('use-route-parameters:invalid-params', { result });
      return {
        invalid: true,
      };
    } else {
      return {
        invalid: false,
        data: result.value as RouteParameters,
      };
    }
  }, [appNavigation.currentHref, schema]);

  return routeParameters;
}
