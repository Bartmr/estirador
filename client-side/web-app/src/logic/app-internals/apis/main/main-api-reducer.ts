import { Reducer } from 'redux';
import { MainApiSessionAction } from './session/main-api-session-actions';
import { MainApiSessionData } from './session/main-api-session-types';
import {
  TransportedDataStatus,
  TransportedData,
} from '../../transports/transported-data/transported-data-types';

export type MainApiStoreState = {
  session: TransportedData<MainApiSessionData | null>;
};
export type MainApiReducer = Reducer<MainApiStoreState, MainApiSessionAction>;

const initialState: MainApiStoreState = {
  session: { status: TransportedDataStatus.NotInitialized },
};

export const mainApiReducer: MainApiReducer = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'STARTED_MAIN_API_SESSION':
    case 'RESTORED_MAIN_API_SESSION':
      return {
        ...state,
        session: {
          status: TransportedDataStatus.Done,
          data: action.payload,
        },
      };
    default:
      return state;
  }
};
