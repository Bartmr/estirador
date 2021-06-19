import { StoreDispatch } from 'src/logic/app-internals/store/store-types';
import { useSessionStorage } from 'src/logic/app-internals/transports/use-session-storage';
import { useLocalStorage } from 'src/logic/app-internals/transports/use-local-storage';
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { mainApiReducer } from '../main-api-reducer';
import { MainApiSessionData } from './main-api-session-types';
import { useMainJSONApi } from '../use-main-json-api';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { boolean } from 'not-me/lib/schemas/boolean/boolean-schema';

class MainApiSession {
  constructor(
    private mainApi: ReturnType<typeof useMainJSONApi>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
    private sessionStorage: ReturnType<typeof useSessionStorage>,
  ) {}

  async login(args: { email: string; password: string }) {
    const res = await this.mainApi.patch<
      | { status: 200; body: { userId: string } }
      | { status: 404; body: undefined },
      undefined,
      typeof args
    >({
      path: '/auth',
      query: undefined,
      body: args,
      acceptableStatusCodes: [200],
    });

    if (res.failure) {
      return res.failure;
    } else {
      if (res.response.status === 404) {
        return 'wrong-credentials';
      } else {
        this.localStorage.saveItem('is-logged-in', true);

        this.setSession(res.response.body);

        return 'ok' as const;
      }
    }
  }

  setSession(session: MainApiSessionData | null) {
    this.dispatch({
      type: 'UPDATE_MAIN_API_SESSION',
      payload: {
        status: TransportedDataStatus.Done,
        data: session,
      },
    });
  }

  async restoreSession() {
    const isLoggedIn = this.localStorage.getItem(boolean(), 'is-logged-in');

    if (isLoggedIn) {
      this.dispatch({
        type: 'UPDATE_MAIN_API_SESSION',
        payload: {
          status: TransportedDataStatus.Loading,
        },
      });

      const res = await this.mainApi.get<
        { status: 200; body: { userId: string } },
        undefined
      >({
        path: '/auth',
        query: undefined,
        acceptableStatusCodes: [200],
      });

      if (res.failure) {
        this.dispatch({
          type: 'UPDATE_MAIN_API_SESSION',
          payload: {
            status: res.failure,
          },
        });
      } else {
        this.setSession(res.response.body);
      }
    } else {
      this.setSession(null);
    }
  }
}

export function useMainApiSession() {
  const mainApi = useMainJSONApi();

  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();
  const sessionStorage = useSessionStorage();

  return new MainApiSession(mainApi, dispatch, localStorage, sessionStorage);
}
