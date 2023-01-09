import { MainApiReducer } from '../apis/main/main-api-reducer';

export type StoreReducersMap = Partial<{
  mainApi: MainApiReducer;
}>;
