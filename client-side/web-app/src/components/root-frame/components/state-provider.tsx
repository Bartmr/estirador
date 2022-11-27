import React, { ReactNode, useEffect, useState } from 'react';
// eslint-disable-next-line node/no-restricted-import
import { Provider } from 'react-redux';
import {
  createStoreManager,
  StoreManagerProvider,
} from 'src/logic/app-internals/store/store-manager';
import { useMainApiSession } from 'src/logic/app-internals/apis/main/session/use-main-api-session';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { RUNNING_IN_CLIENT } from 'src/logic/app-internals/runtime/running-in';
import { SSRProvider } from 'react-bootstrap';

let previousRuntimeData:
  | undefined
  | {
      storeManager: ReturnType<typeof createStoreManager>;
    };
type ModuleHotData = {
  storeManager: ReturnType<typeof createStoreManager>;
};

const FrameWithState = (props: { children: ReactNode }) => {
  const mainApiSession = useMainApiSession();

  const mainApiState = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi,
  );

  useEffect(() => {
    (async () => {
      if (
        mainApiState.session.status === TransportedDataStatus.NotInitialized
      ) {
        await mainApiSession.restoreSession();
      }
    })();
  }, [mainApiState.session.status]);

  return <SSRProvider>{props.children}</SSRProvider>;
};

export function StateProvider(props: { children: ReactNode }) {
  const [storeManager] = useState(() => {
    const storeManagerFromPreviousRuntime = module.hot
      ? previousRuntimeData?.storeManager ||
        (module.hot.data as ModuleHotData | undefined)?.storeManager
      : undefined;

    const storeManagerForCurrentRuntime =
      storeManagerFromPreviousRuntime || createStoreManager();

    if (module.hot && RUNNING_IN_CLIENT) {
      previousRuntimeData = {
        storeManager: storeManagerForCurrentRuntime,
      };

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
