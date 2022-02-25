import React, { ReactNode, useState } from 'react';
// eslint-disable-next-line node/no-restricted-import
import { Provider } from 'react-redux';
import {
  createStoreManager,
  StoreManagerProvider,
} from 'src/logic/app-internals/store/store-manager';
import { RUNNING_IN_CLIENT } from 'src/logic/app-internals/runtime/running-in';
import { SSRProvider } from 'react-bootstrap';

type ModuleHotData = {
  storeManager?: ReturnType<typeof createStoreManager>;
};

const FrameWithState = (props: { children: ReactNode }) => {
  return <SSRProvider>{props.children}</SSRProvider>;
};

export function StateProvider(props: { children: ReactNode }) {
  const [storeManager] = useState(() => {
    const storeManagerFromPreviousRuntime = (
      module.hot?.data as ModuleHotData | undefined
    )?.storeManager;

    const storeManagerForCurrentRuntime =
      storeManagerFromPreviousRuntime || createStoreManager();

    if (module.hot && RUNNING_IN_CLIENT) {
      module.hot.dispose((data: ModuleHotData) => {
        data.storeManager = storeManagerForCurrentRuntime;
      });
    }

    return storeManagerForCurrentRuntime;
  });

  return (
    <StoreManagerProvider storeManager={storeManager}>
      <Provider store={storeManager.store}>
        <FrameWithState>{props.children}</FrameWithState>
      </Provider>
    </StoreManagerProvider>
  );
}
