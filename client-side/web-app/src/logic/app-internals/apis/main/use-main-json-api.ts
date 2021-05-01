import { MAIN_API_CONFIG } from '@config/main-api-config';
import { JSONApiBase } from '../json-api-base';
import { useJSONHttp } from '../../transports/http/json/use-json-http';
import { useStoreGetState } from '../../store/use-store-get-state';
import { mainApiReducer } from './main-api-reducer';
import { useMainApiSession } from './session/use-main-api-session';

class MainJSONApi extends JSONApiBase {}

export function useMainJSONApi() {
  const jsonHttp = useJSONHttp();
  const mainApiSession = useMainApiSession();

  const getStoreState = useStoreGetState({ mainApi: mainApiReducer });

  return new MainJSONApi({
    jsonHttp,
    apiUrl: MAIN_API_CONFIG.apiUrl,
    getHeaders: () => {
      const mainApiState = getStoreState().mainApi;

      const token = mainApiState.session.data?.token;

      if (token) {
        return {
          Authorization: `Bearer ${token}`,
        };
      } else {
        return {};
      }
    },
    logout: () => {
      mainApiSession.logout();
    },
  });
}
