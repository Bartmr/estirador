import { TransportedData } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { MainApiSessionData } from './main-api-session-types';

export const MAIN_API_SESSION_LOGOUT = 'MAIN_API_SESSION_LOGOUT';

export type MainApiSessionAction =
  | {
      type: 'UPDATE_MAIN_API_SESSION';
      payload: TransportedData<MainApiSessionData | null>;
    }
  | {
      type: typeof MAIN_API_SESSION_LOGOUT;
    }
  | {
      type: 'FINISHED_LOGGING_OUT';
    };
