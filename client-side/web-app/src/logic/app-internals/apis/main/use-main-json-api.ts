import { MAIN_API_CONFIG } from '@config/main-api-config';
import { JSONApiBase } from '../json-api-base';
import { useJSONHttp } from '../../transports/http/json/use-json-http';
import { useMainApiSessionLogout } from './session/use-main-api-session-logout';

class MainJSONApi extends JSONApiBase {}

export function useMainJSONApi() {
  const jsonHttp = useJSONHttp();
  const mainApiSessionLogout = useMainApiSessionLogout();

  return new MainJSONApi({
    jsonHttp,
    apiUrl: MAIN_API_CONFIG.apiUrl,
    getHeaders: () => {
      return {};
    },
    logout: async () => {
      await mainApiSessionLogout.logout();
    },
  });
}
