import React, { FunctionComponent, ReactNode } from 'react';
import {
  AuthenticatedRouteRules,
  AuthenticatedRouteAccess,
} from './authenticated-route-types';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { Redirect } from '../redirect/redirect';
import { LOGIN_ROUTE } from 'src/components/templates/login/login-routes';
import { INDEX_ROUTE } from 'src/components/templates/index/index-routes';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';

type Props = {
  children: () => ReactNode;
  authenticationRules: AuthenticatedRouteRules | null;
};

export const AuthenticatedRoute: FunctionComponent<Props> = (props) => {
  const sessionWrapper = useStoreSelector(
    { mainApi: mainApiReducer },
    (state) => state.mainApi.session,
  );

  const authenticationRules = props.authenticationRules;

  if (!authenticationRules) {
    return <>{props.children()}</>;
  } else {
    return (
      <TransportedDataGate className="w-100" dataWrapper={sessionWrapper}>
        {({ data: session }) => {
          const mainApiAuthRule = authenticationRules.mainApiSession;

          if (mainApiAuthRule.access === AuthenticatedRouteAccess.Allow) {
            if (session) {
              return <>{props.children()}</>;
            } else {
              return (
                <Redirect
                  href={
                    mainApiAuthRule.hrefToRedirectTo || LOGIN_ROUTE.getHref()
                  }
                />
              );
            }
          } else {
            if (session) {
              return (
                <Redirect
                  href={
                    mainApiAuthRule.hrefToRedirectTo || INDEX_ROUTE.getHref()
                  }
                />
              );
            } else {
              return <>{props.children()}</>;
            }
          }
        }}
      </TransportedDataGate>
    );
  }
};
