import { useEffect, useState } from 'react';
import { SerializableJSONValue } from '../transports/json-types';
import { useParams } from '@reach/router';
import { useAppNavigation } from './use-app-navigation';
import { Logger } from '../logging/logger';
import { InferType, Schema } from 'not-me/lib/schemas/schema';

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

  const unparsedParameters = useParams() as unknown;
  const appNavigation = useAppNavigation();

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

  useEffect(() => {
    replaceRouteParameters(parse());
  }, [appNavigation.currentHref, schema]);

  return routeParameters;
}
