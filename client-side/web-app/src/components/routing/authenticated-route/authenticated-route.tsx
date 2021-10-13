import React, { FunctionComponent, ReactNode } from 'react';
import { AuthenticatedRouteRules } from './authenticated-route-types';

type Props = {
  children: () => ReactNode;
  authenticationRules: AuthenticatedRouteRules | null;
};

export const AuthenticatedRoute: FunctionComponent<Props> = (props) => {
  return <>{props.children()}</>;
};
