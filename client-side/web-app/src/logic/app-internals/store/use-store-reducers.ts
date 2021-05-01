import { useStoreManager } from './store-manager';
import { StoreReducersMap } from './store-reducers-map';

export function useStoreReducers(
  reducersMapToLoad: Partial<StoreReducersMap>,
): void {
  const storeManager = useStoreManager();

  storeManager.loadReducersMap(reducersMapToLoad);
}
