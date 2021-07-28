import {
  OutgoingHeaders,
  ServerSideJSONApiBase,
} from '../server-side-json-api-base';
import { MAIN_API_CONFIG } from '@config/main-api-config';

class ServerSideMainJSONApiImpl extends ServerSideJSONApiBase {
  public apiUrl: string;
  public getDefaultHeaders: () => OutgoingHeaders;

  constructor() {
    super();

    this.apiUrl = MAIN_API_CONFIG.apiUrl;
    this.getDefaultHeaders = () => ({});
  }
}

export const ServerSideMainJSONApi = new ServerSideMainJSONApiImpl();
