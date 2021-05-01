/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react';
import { RootFrame } from './src/components/root-frame/root-frame';
import { attachFontsProviders } from './src/components/ui-kit/fonts-ssr-apis';

export const wrapRootElement = ({ element }) => (
  <RootFrame>{element}</RootFrame>
);

export const onPreRenderHTML = (...args) => {
  attachFontsProviders(...args);
};
