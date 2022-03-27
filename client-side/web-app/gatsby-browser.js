/*
  Logger must be imported first in order to log any uncaught exception
  thrown during the modules initialization

  Logger is supposed to be imported here and in root-frame.tsx
*/
import './src/logic/app-internals/logging/logger';

import React from 'react';
import { RootFrame } from './src/components/root-frame/root-frame';

export const wrapRootElement = ({ element }) => {
  return <RootFrame>{element}</RootFrame>;
};
