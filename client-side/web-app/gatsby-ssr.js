/**
 * Implement Gatsby's SSR (Server Side Rendering) APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/ssr-apis/
 */

import React from 'react';
import { RootFrame } from './src/components/root-frame/root-frame';
import { onPreRenderHTML as onPreRenderHTMLImpl } from './src/on-pre-render-html';

export const wrapRootElement = ({ element }) => (
  <RootFrame>{element}</RootFrame>
);

export const onPreRenderHTML = onPreRenderHTMLImpl;
