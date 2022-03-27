import React from 'react';
import { RootFrame } from './src/components/root-frame/root-frame';
import { onPreRenderHTML as onPreRenderHTMLImpl } from './src/on-pre-render-html';

export const onPreRenderHTML = onPreRenderHTMLImpl;

export const wrapRootElement = ({ element }) => {
  return <RootFrame>{element}</RootFrame>;
};
