import { useEffect } from 'react';
import { useMainJSONApi } from '../apis/main/use-main-json-api';
import { useStoreDispatch } from '../store/use-store-dispatch';
import { useStoreSelector } from '../store/use-store-selector';
import { TransportedDataStatus } from '../transports/transported-data/transported-data-types';
import { remoteConfigReducer } from './remote-config-reducer';
import { RemoteConfig } from './remote-config-types';

export function useRemoteConfig() {
  const mainApi = useMainJSONApi();

  const reducersToLoad = {
    remoteConfig: remoteConfigReducer,
  };

  const remoteConfigStoreState = useStoreSelector(
    reducersToLoad,
    (s) => s.remoteConfig,
  );

  const dispatch = useStoreDispatch(reducersToLoad);

  useEffect(() => {
    if (
      !remoteConfigStoreState.data &&
      remoteConfigStoreState.status !== TransportedDataStatus.Loading
    ) {
      (async () => {
        const res = await mainApi.get<
          { status: 200; body: RemoteConfig },
          undefined
        >({
          path: '/remote-config',
          query: undefined,
          acceptableStatusCodes: [200],
        });

        if (res.failure) {
          dispatch({
            type: 'UPDATE_REMOTE_CONFIG',
            payload: {
              status: res.failure,
            },
          });
        } else {
          dispatch({
            type: 'UPDATE_REMOTE_CONFIG',
            payload: {
              status: TransportedDataStatus.Done,
              data: res.response.body,
            },
          });
        }
      })();
    }
  }, []);

  return remoteConfigStoreState;
}
