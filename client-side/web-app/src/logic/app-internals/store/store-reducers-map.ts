import { MainApiReducer } from '../apis/main/main-api-reducer';
import { RemoteConfigReducer } from '../remote-config/remote-config-reducer';

export type StoreReducersMap = Partial<{
  mainApi: MainApiReducer;
  remoteConfig: RemoteConfigReducer;
}>;
