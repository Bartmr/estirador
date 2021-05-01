import React from 'react';
import { Page } from 'src/components/routing/page/page';
import { INDEX_ROUTE } from './index-routes';

export const IndexTemplate = () => (
  <Page authenticationRules={null} title={INDEX_ROUTE.label}>
    {() => {
      return <h1>Home</h1>;
    }}
  </Page>
);
