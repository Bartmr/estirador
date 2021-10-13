import { StoreDispatch } from 'src/logic/app-internals/store/store-types';
import { useLocalStorage } from 'src/logic/app-internals/transports/use-local-storage';
import { useStoreDispatch } from 'src/logic/app-internals/store/use-store-dispatch';
import { mainApiReducer } from '../main-api-reducer';
import { LoginResponse, MainApiSessionData } from './main-api-session-types';
import { useMainJSONApi } from '../use-main-json-api';
import { TransportedDataStatus } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { LoginRequestDTO } from '@app/shared/auth/auth.dto';
import { ToJSON } from '@app/shared/internals/transports/json-type-converters';
import { MAIN_API_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY } from './main-api-session-constants';

class MainApiSession {
  constructor(
    private mainApi: ReturnType<typeof useMainJSONApi>,
    private dispatch: StoreDispatch<'mainApi'>,
    private localStorage: ReturnType<typeof useLocalStorage>,
  ) {}

  async login(args: { email: string; password: string }) {
    const res = await this.mainApi.post<
      { status: 201; body: LoginResponse } | { status: 404; body: undefined },
      undefined,
      ToJSON<LoginRequestDTO>
    >({
      path: '/auth',
      query: undefined,
      body: args,
      acceptableStatusCodes: [201, 404],
    });

    if (res.failure) {
      return res.failure;
    } else {
      if (res.response.status === 404) {
        return 'wrong-credentials';
      } else {
        this.localStorage.setItem(
          MAIN_API_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY,
          res.response.body.authTokenId,
        );
        this.setSession(res.response.body.session);

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
    this.dispatch({
      type: 'UPDATE_MAIN_API_SESSION',
      payload: {
        status: TransportedDataStatus.Loading,
      },
    });

    const res = await this.mainApi.get<
      | { status: 200; body: MainApiSessionData }
      | { status: 404; body: undefined },
      undefined
    >({
      path: '/auth',
      query: undefined,
      acceptableStatusCodes: [200, 404],
    });

    if (res.failure) {
      this.dispatch({
        type: 'UPDATE_MAIN_API_SESSION',
        payload: {
          status: res.failure,
        },
      });
    } else {
      if (res.response.status === 404) {
        this.setSession(null);
      } else {
        this.setSession(res.response.body);
      }
    }
  }
}

export function useMainApiSession() {
  const mainApi = useMainJSONApi();

  const dispatch = useStoreDispatch({ mainApi: mainApiReducer });

  const localStorage = useLocalStorage();

  return new MainApiSession(mainApi, dispatch, localStorage);
}
