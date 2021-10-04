import React from 'react';
import { Page } from 'src/components/routing/page/page';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { NOT_FOUND_ROUTE } from './not-found-routes';

type Props = {};

export const NotFoundTemplate = (_: Props) => (
  <Page title={NOT_FOUND_ROUTE.label} authenticationRules={null}>
    {() => {
      return (
        <TransportedDataGate
          dataWrapper={{ status: TransportFailure.NotFound }}
        >
          {() => null}
        </TransportedDataGate>
      );
    }}
  </Page>
);
