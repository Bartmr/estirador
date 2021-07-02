import { TransportedData } from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { RemoteConfig } from './remote-config-types';

export type RemoteConfigAction = {
  type: 'UPDATE_REMOTE_CONFIG';
  payload: TransportedData<RemoteConfig>;
};
