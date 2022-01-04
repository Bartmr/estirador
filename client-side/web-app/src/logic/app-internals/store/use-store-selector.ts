// eslint-disable-next-line node/no-restricted-import
import { useSelector } from 'react-redux';
import { StateFromReducersMapObject } from 'redux';
import { FullyLoadedStoreReducersMap } from './store-types';
import { useStoreReducers } from './use-store-reducers';

export function useStoreSelector<
  ReducersMapToLoad extends Partial<FullyLoadedStoreReducersMap>,
  TSelected,
>(
  reducersMapToLoad: ReducersMapToLoad,
  selector: (state: StateFromReducersMapObject<ReducersMapToLoad>) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean,
): TSelected {
  useStoreReducers(reducersMapToLoad);

  const selected = useSelector<
    StateFromReducersMapObject<ReducersMapToLoad>,
    TSelected
  >(selector, equalityFn);

  return selected;
}
