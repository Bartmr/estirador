import React, { ReactNode } from 'react';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { LOGIN_ROUTE } from 'src/components/templates/login/login-routes';
import { INDEX_ROUTE } from 'src/components/templates/index/index-routes';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { isTransportFailure } from 'src/logic/app-internals/transports/transported-data/is-transport-failure';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import {
  AuthenticatedRouteAccess,
  AuthenticatedRouteRules,
} from 'src/components/routing/authenticated-route/authenticated-route-types';
import { Redirect } from 'src/components/routing/redirect/redirect';

export const AuthenticatedFrame = (props: {
  children: () => ReactNode;
  authenticationRules: AuthenticatedRouteRules;
}) => {
  const sessionWrapper = useStoreSelector(
    { mainApi: mainApiReducer },
    (state) => state.mainApi.session,
  );

  if (typeof sessionWrapper.data === 'undefined') {
    return null;
  } else if (
    isTransportFailure(sessionWrapper.status) ||
    sessionWrapper.status === TransportedDataStatus.Loading
  ) {
    return (
      <TransportedDataGate dataWrapper={sessionWrapper}>
        {() => null}
      </TransportedDataGate>
    );
  } else {
    const session = sessionWrapper.data;
    const mainApiAuthRule = props.authenticationRules.mainApiSession;

    if (mainApiAuthRule.access === AuthenticatedRouteAccess.Allow) {
      if (session) {
        return <>{props.children()}</>;
      } else {
        return (
          <Redirect
            href={mainApiAuthRule.hrefToRedirectTo || LOGIN_ROUTE.getHref()}
          />
        );
      }
    } else {
      if (session) {
        return (
          <Redirect
            href={mainApiAuthRule.hrefToRedirectTo || INDEX_ROUTE.getHref()}
          />
        );
      } else {
        return <>{props.children()}</>;
      }
    }
  }
};
