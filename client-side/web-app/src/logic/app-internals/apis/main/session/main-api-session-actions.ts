import { MainApiSessionData } from './main-api-session-types';

export const MAIN_API_SESSION_LOGOUT = 'MAIN_API_SESSION_LOGOUT';

export type MainApiSessionAction =
  | {
      type: 'STARTED_MAIN_API_SESSION';
      payload: MainApiSessionData;
    }
  | {
      type: 'RESTORED_MAIN_API_SESSION';
      payload: MainApiSessionData | null;
    }
  | {
      type: typeof MAIN_API_SESSION_LOGOUT;
    };
