import { ReactNode } from 'react';
import { mainApiReducer } from '../../../logic/app-internals/apis/main/main-api-reducer';
import { getCurrentLocalHref } from '../../../logic/app-internals/navigation/get-current-local-href';
import { useStoreSelector } from '../../../logic/app-internals/store/use-store-selector';
import { TransportedDataGate } from '../../shared/transported-data-gate/transported-data-gate';
import { INDEX_ROUTE } from '../../templates/index/index-routes';
import { LOGIN_ROUTE } from '../../templates/login/login-routes';
import { Redirect } from '../redirect/redirect';
import {
  AuthenticatedGateAccess,
  AuthenticatedGateRules,
} from './authenticated-gate-types';

type Props = {
  authenticationRules: AuthenticatedGateRules | null;
  children: ReactNode;
};

export function AuthenticationGate(props: Props) {
  const sessionWrapper = useStoreSelector(
    { mainApi: mainApiReducer },
    (state) => state.mainApi.session,
  );

  if (!props.authenticationRules) {
    return <>{props.children}</>;
  } else {
    if (typeof sessionWrapper.data === 'undefined') {
      return (
        <TransportedDataGate className="py-3" dataWrapper={sessionWrapper}>
          {() => null}
        </TransportedDataGate>
      );
    } else {
      const session = sessionWrapper.data;
      const mainApiAuthRule = props.authenticationRules.mainApiSession;

      if (mainApiAuthRule.access === AuthenticatedGateAccess.Allow) {
        if (session) {
          return <>{props.children}</>;
        } else {
          return (
            <Redirect
              href={
                mainApiAuthRule.hrefToRedirectTo ||
                LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() })
              }
            />
          );
        }
      } else {
        if (session) {
          const searchParams = new URLSearchParams(window.location.search);

          const next = searchParams.get('next');

          return (
            <Redirect
              href={
                mainApiAuthRule.hrefToRedirectTo ||
                (next && !next.startsWith(window.location.pathname)
                  ? next
                  : undefined) ||
                INDEX_ROUTE.getHref()
              }
            />
          );
        } else {
          return <>{props.children}</>;
        }
      }
    }
  }
}
