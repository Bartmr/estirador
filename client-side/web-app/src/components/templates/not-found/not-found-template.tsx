import React from 'react';
import { RouteComponentProps } from '@reach/router';
import { Layout } from 'src/components/routing/layout/layout';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { NOT_FOUND_ROUTE } from './not-found-routes';

type Props = RouteComponentProps;

export const NotFoundTemplate = (_: Props) => (
  <Layout title={NOT_FOUND_ROUTE.label} authenticationRules={null}>
    {() => {
      return (
        <TransportedDataGate
          dataWrapper={{ status: TransportFailure.NotFound }}
        >
          {() => null}
        </TransportedDataGate>
      );
    }}
  </Layout>
);
