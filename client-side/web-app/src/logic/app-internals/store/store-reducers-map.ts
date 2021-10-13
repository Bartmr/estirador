import { RemoteConfigReducer } from '../remote-config/remote-config-reducer';

export type StoreReducersMap = Partial<{
  remoteConfig: RemoteConfigReducer;
}>;
