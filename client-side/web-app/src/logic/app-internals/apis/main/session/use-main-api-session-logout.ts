import {
  StoreDispatch,
  StoreGetState,
} from 'src/logic/app-internals/store/store-types';
import { MAIN_API_SESSION_LOGOUT } from './main-api-session-actions';
import { useSessionStorage } from 'src/logic/app-internals/transports/use-session-storage';
import { useLocalStorage } from 'src/logic/app-internals/transports/use-local-storage';
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { mainApiReducer } from '../main-api-reducer';
import { useStoreGetState } from 'src/logic/app-internals/store/use-store-get-state';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';

class MainApiSessionLogout {
  constructor(
    private getState: StoreGetState<'mainApi'>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private sessionStorage: ReturnType<typeof useSessionStorage>,
  ) {}

  async logout() {
    const state = this.getState();

    if (state.mainApi.session.status === TransportedDataStatus.Loading) {
      return;
    }
    this.dispatch({
      type: MAIN_API_SESSION_LOGOUT,
    });

    /* ----- */

    this.localStorage.wipeAll();
    this.sessionStorage.wipeAll();

    this.dispatch({
      type: 'UPDATE_MAIN_API_SESSION',
      payload: {
        status: TransportedDataStatus.NotInitialized,
      },
    });
  }
}

export function useMainApiSessionLogout() {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });
  const getMainApiState = useStoreGetState({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();
  const sessionStorage = useSessionStorage();

  return new MainApiSessionLogout(
    getMainApiState,
    dispatch,
    localStorage,
    sessionStorage,
  );
}
