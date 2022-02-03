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
import { LOGIN_ROUTE } from 'src/components/templates/login/login-routes';

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

    this.localStorage.wipeAll();
    this.sessionStorage.wipeAll();

    /*
      Redirect to the login page,
      in order to remove all the TransportedDataGates in public pages
      that are stuck in TransportFailure.AbortedAndDealtWith,
      and also to explicitly point out to the user that the session has expired.

      In case you need to change where to redirect to,
      do not redirect back to the same page, since some cases might lead to an endless reload loop
      of no session > unauthorized response > trigger logout > reload > no session...
    */
    const currentHref = window.location.href;
    window.location.href = LOGIN_ROUTE.getHref({ next: currentHref });
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
