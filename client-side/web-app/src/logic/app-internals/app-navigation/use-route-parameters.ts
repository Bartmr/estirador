import { useEffect, useState } from 'react';
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
  type RouteParameters = InferType<RouteParametersSchema>;

  type RouteParametersResult = Readonly<
    | { isServerSide: true }
    | { isServerSide: false; invalid: true }
    | { isServerSide: false; invalid: false; data: Readonly<RouteParameters> }
  >;

  const [routeParameters, replaceRouteParameters] =
    useState<RouteParametersResult>({ isServerSide: true });

  const router = useRouter();
  const appNavigation = useAppNavigation();

  const parse = (): RouteParametersResult => {
    const result = schema.validate(router.query);

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

  useEffect(() => {
    replaceRouteParameters(parse());
  }, [appNavigation.currentHref]);

  return routeParameters;
}
