import { StoreDispatch } from 'src/logic/app-internals/store/store-types';
import { MAIN_API_SESSION_LOGOUT } from './main-api-session-actions';
import { useSessionStorage } from 'src/logic/app-internals/transports/use-session-storage';
import { useLocalStorage } from 'src/logic/app-internals/transports/use-local-storage';
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { mainApiReducer } from '../main-api-reducer';
import { MAIN_API_CONFIG } from '@config/main-api-config';

class MainApiSessionLogout {
  constructor(
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private sessionStorage: ReturnType<typeof useSessionStorage>,
  ) {}

  async logout() {
    const res = await fetch(`${MAIN_API_CONFIG.apiUrl}/auth`, {
      method: 'DELETE',
    });

    if (res.status !== 204) {
      throw new Error();
    }

    this.dispatch({
      type: MAIN_API_SESSION_LOGOUT,
    });

    this.localStorage.wipeAll();
    this.sessionStorage.wipeAll();
  }
}

export function useMainApiSessionLogout() {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();
  const sessionStorage = useSessionStorage();

  return new MainApiSessionLogout(dispatch, localStorage, sessionStorage);
}
