import { StoreDispatch } from 'src/logic/app-internals/store/store-types';
import { MAIN_API_SESSION_LOGOUT } from './main-api-session-actions';
import { useSessionStorage } from 'src/logic/app-internals/transports/use-session-storage';
import { useLocalStorage } from 'src/logic/app-internals/transports/use-local-storage';
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { mainApiReducer } from '../main-api-reducer';
import { MainApiSessionData } from './main-api-session-types';

class MainApiSession {
  constructor(
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private sessionStorage: ReturnType<typeof useSessionStorage>,
  ) {}

  startUserSession(session: MainApiSessionData) {
    this.dispatch({
      type: 'STARTED_MAIN_API_SESSION',
      payload: session,
    });
  }

  logout() {
    this.dispatch({
      type: MAIN_API_SESSION_LOGOUT,
    });

    this.localStorage.wipeAll();
    this.sessionStorage.wipeAll();
  }

  restorePersistedSession() {
    this.dispatch({
      type: 'RESTORED_MAIN_API_SESSION',
      payload: null,
    });
  }
}

export function useMainApiSession() {
  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();
  const sessionStorage = useSessionStorage();

  return new MainApiSession(dispatch, localStorage, sessionStorage);
}
