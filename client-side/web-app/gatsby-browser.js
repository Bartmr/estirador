// KEEP AS TOP IMPORT
import { RootFrame } from './src/components/root-frame/root-frame';

//

import React, { useEffect, useState } from 'react';

const Wrapper = (props) => {
  const [ReloadedRootFrame, replaceReloadedRootFrame] = useState(
    () => RootFrame,
  );

  useEffect(() => {
    if (module.hot) {
      module.hot.accept(['./src/components/root-frame/root-frame'], () => {
        replaceReloadedRootFrame(
          () => require('./src/components/root-frame/root-frame').RootFrame,
        );
      });
    }
  }, []);

  return <ReloadedRootFrame>{props.children}</ReloadedRootFrame>;
};

export const wrapRootElement = ({ element }) => {
  return <Wrapper>{element}</Wrapper>;
};
