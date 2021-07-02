import { Reducer } from 'redux';
import {
  TransportedData,
  TransportedDataStatus,
} from '../transports/transported-data/transported-data-types';
import { RemoteConfigAction } from './remote-config-actions';
import { RemoteConfig } from './remote-config-types';

export type RemoteConfigStoreState = TransportedData<RemoteConfig>;

export type RemoteConfigReducer = Reducer<
  RemoteConfigStoreState,
  RemoteConfigAction
>;

const initialState: RemoteConfigStoreState = {
  status: TransportedDataStatus.NotInitialized,
};

export const remoteConfigReducer: RemoteConfigReducer = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'UPDATE_REMOTE_CONFIG':
      return action.payload;
    default:
      return state;
  }
};
