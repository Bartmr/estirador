import { JSONApiBase } from '../json-api-base';
import { useJSONHttp } from '../../transports/http/json/use-json-http';
import { EnvironmentVariables } from '../../runtime/environment-variables';

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

  return new MainJSONApi({
    jsonHttp,
    apiUrl: EnvironmentVariables.MAIN_API_URL,
    getHeaders: () => {
      return {};
    },
    onInvalidAuthToken: null,
  });
}
