import { Reducer } from 'redux';
import { MainApiSessionAction } from './session/main-api-session-actions';
import { MainApiSessionData } from './session/main-api-session-types';
import {
  TransportedDataStatus,
  TransportedData,
} from '../../transports/transported-data/transported-data-types';

export type MainApiStoreState = {
  session: TransportedData<MainApiSessionData | null>;
  isLoggingOut: boolean;
};
export type MainApiReducer = Reducer<MainApiStoreState, MainApiSessionAction>;

const initialState: MainApiStoreState = {
  session: { status: TransportedDataStatus.NotInitialized },
  isLoggingOut: false,
};

export const mainApiReducer: MainApiReducer = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'UPDATE_MAIN_API_SESSION':
      return {
        ...state,
        session: action.payload,
      };
    case 'FINISHED_LOGGING_OUT':
      return {
        ...state,
        isLoggingOut: false,
      };
    default:
      return state;
  }
};
