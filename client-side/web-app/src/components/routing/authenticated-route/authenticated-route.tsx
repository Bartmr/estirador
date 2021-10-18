import React, { FunctionComponent } from 'react';
import { AuthenticatedRouteRules } from './authenticated-route-types';
import { RouteComponentProps } from '@reach/router';

interface Props extends RouteComponentProps {
  component: React.JSXElementConstructor<RouteComponentProps>;
  authenticationRules: AuthenticatedRouteRules;
}

export const AuthenticatedRoute: FunctionComponent<Props> = ({
  authenticationRules: _authenticationRules,
  component: Component,
  ...rest
}) => {
  return <Component {...rest} />;
};
