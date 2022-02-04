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
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { navigate } from 'gatsby';
import { LOGIN_ROUTE } from 'src/components/templates/login/login-routes';
import { getCurrentLocalHref } from 'src/logic/app-internals/navigation/get-current-local-href';

type ModuleHotData = {
  storeManager?: ReturnType<typeof createStoreManager>;
};

const FrameWithState = (props: { children: ReactNode }) => {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

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
        if (mainApiState.isLoggingOut) {
          await navigate(LOGIN_ROUTE.getHref({ next: getCurrentLocalHref() }));

          dispatch({
            type: 'FINISHED_LOGGING_OUT',
          });
        }

        await mainApiSession.restoreSession();
      }
    })();
  }, [mainApiState.session.status]);

  return <>{props.children}</>;
};

export function StatefulFrame(props: { children: ReactNode }) {
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
