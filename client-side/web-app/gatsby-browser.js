/*
  Logger must be imported first in order to log any uncaught exception
  thrown during the modules initialization

  Logger is supposed to be imported here and in root-frame.tsx
*/
import './src/logic/app-internals/logging/logger';

import React, { useEffect, useState } from 'react';

const RootWrapper = (props) => {
  const [RootFrame, replaceRootFrame] = useState(
    () => require('./src/components/root-frame/root-frame').RootFrame,
  );

  useEffect(() => {
    if (module.hot) {
      module.hot.accept(
        ['./src/components/root-frame/root-frame'],
        function () {
          replaceRootFrame(
            () => require('./src/components/root-frame/root-frame').RootFrame,
          );
        },
      );
    }
  }, []);

  return <RootFrame>{props.children}</RootFrame>;
};

export const wrapRootElement = ({ element }) => (
  <RootWrapper>{element}</RootWrapper>
);
