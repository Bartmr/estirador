import { useDispatch } from 'react-redux';
import { ActionFromReducersMapObject, Dispatch } from 'redux';
import { FullyLoadedStoreReducersMap } from './store-types';
import { useStoreReducers } from './use-store-reducers';

export function useStoreDispatch<
  ReducersMapToLoad extends Partial<FullyLoadedStoreReducersMap>,
>(reducersMapToLoad: ReducersMapToLoad) {
  useStoreReducers(reducersMapToLoad);

  const storeDispatch =
    useDispatch<Dispatch<ActionFromReducersMapObject<ReducersMapToLoad>>>();

  return storeDispatch;
}
