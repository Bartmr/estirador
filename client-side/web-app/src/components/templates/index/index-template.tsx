import React from 'react';
import { Layout } from 'src/components/routing/layout/layout';
import { INDEX_ROUTE } from './index-routes';

export const IndexTemplate = () => (
  <Layout authenticationRules={null} title={INDEX_ROUTE.label}>
    {() => {
      return <h1>Home</h1>;
    }}
  </Layout>
);
