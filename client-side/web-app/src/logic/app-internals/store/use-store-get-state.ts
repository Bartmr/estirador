import { StateFromReducersMapObject } from 'redux';
import { useStoreManager } from './store-manager';
import { FullyLoadedStoreReducersMap } from './store-types';
import { useStoreReducers } from './use-store-reducers';

/**
 * Useful for getting the most recent store state
 * in the middle of an async function
 */
export function useStoreGetState<
  ReducersMapToLoad extends Partial<FullyLoadedStoreReducersMap>
>(
  reducersMapToLoad: ReducersMapToLoad,
): () => StateFromReducersMapObject<ReducersMapToLoad> {
  useStoreReducers(reducersMapToLoad);

  const storeManager = useStoreManager();

  const store = storeManager.store;

  return () => {
    return store.getState() as StateFromReducersMapObject<ReducersMapToLoad>;
  };
}
