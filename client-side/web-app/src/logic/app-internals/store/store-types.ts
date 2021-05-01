import {
  ActionFromReducersMapObject,
  Dispatch,
  Store as ReduxStore,
} from 'redux';
import { StoreReducersMap } from './store-reducers-map';

export type FullyLoadedStoreReducersMap = Required<StoreReducersMap>;
export type FullyLoadedStoreState = Required<StoreState>;

export type StoreAction = ActionFromReducersMapObject<FullyLoadedStoreReducersMap>;

export type StoreState = {
  [K in keyof StoreReducersMap]: ReturnType<NonNullable<StoreReducersMap[K]>>;
};

export type Store = ReduxStore<StoreState, StoreAction>;

export type StoreDispatch<
  ReducerKey extends keyof FullyLoadedStoreReducersMap
> = Dispatch<
  ActionFromReducersMapObject<
    {
      [K in ReducerKey]: FullyLoadedStoreReducersMap[K];
    }
  >
>;

export type StoreGetState<
  StateKey extends keyof FullyLoadedStoreState
> = () => {
  [K in StateKey]: FullyLoadedStoreState[K];
};
