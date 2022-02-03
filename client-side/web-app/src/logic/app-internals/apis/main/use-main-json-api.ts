import { JSONApiBase } from '../json-api-base';
import { useJSONHttp } from '../../transports/http/json/use-json-http';
import { MAIN_API_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY } from './session/main-api-session-constants';
import { useLocalStorage } from '../../transports/use-local-storage';
import { useMainApiSessionLogout } from './session/use-main-api-session-logout';
import { MainApiAuthTokenIdLocalStorageSchema } from './session/main-api-session-schemas';
import { EnvironmentVariables } from '../../runtime/environment-variables';
import { useStoreGetState } from '../../store/use-store-get-state';
import { mainApiReducer } from './main-api-reducer';

class MainJSONApi extends JSONApiBase {}

export function useMainJSONApi() {
  /*
    Note:
    calling useMainApiSession here will cause an endless loop
    since useMainApiSession itself already calls and uses useMainJSONApi

    To get tokens and other information,
    read them from the Redux Store or directly from the Local Storage
  */
  const jsonHttp = useJSONHttp();
  const localStorage = useLocalStorage();
  const mainApiSessionLogout = useMainApiSessionLogout();
  const getMainApiState = useStoreGetState({ mainApi: mainApiReducer });

  return new MainJSONApi({
    jsonHttp,
    apiUrl: EnvironmentVariables.MAIN_API_URL,
    getHeaders: () => {
      const authTokenId = localStorage.getItem(
        MainApiAuthTokenIdLocalStorageSchema,
        MAIN_API_AUTH_TOKEN_ID_LOCAL_STORAGE_KEY,
      );

      if (authTokenId) {
        return {
          Authorization: `Bearer ${authTokenId}`,
        };
      } else {
        return {};
      }
    },
    onInvalidAuthToken: async () => {
      await mainApiSessionLogout.logout();
    },
    hasSession: () => {
      const sessionData = getMainApiState().mainApi.session.data;

      return !!sessionData;
    },
  });
}
