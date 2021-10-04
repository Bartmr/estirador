import { EnvironmentVariables } from '../../runtime/environment-variables';
import {
  OutgoingHeaders,
  ServerSideJSONApiBase,
} from '../server-side-json-api-base';

class ServerSideMainJSONApiImpl extends ServerSideJSONApiBase {
  public apiUrl: string;
  public getDefaultHeaders: () => OutgoingHeaders;

  constructor() {
    super();

    this.apiUrl = EnvironmentVariables.MAIN_API_URL;
    this.getDefaultHeaders = () => ({});
  }
}

export const ServerSideMainJSONApi = new ServerSideMainJSONApiImpl();
