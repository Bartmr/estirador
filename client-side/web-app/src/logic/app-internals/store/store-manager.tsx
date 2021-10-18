import {
  combineReducers,
  createStore as createReduxStore,
  Reducer,
} from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension/developmentOnly';
import { Store, StoreAction, StoreState } from './store-types';
import { MAIN_API_SESSION_LOGOUT } from '../apis/main/session/main-api-session-actions';
import { StoreReducersMap } from './store-reducers-map';
import { createContext, ReactNode, useContext } from 'react';
import { throwError } from '../utils/throw-error';

type RootReducer = Reducer<StoreState, StoreAction>;

class StoreManager {
  public store: Store;
  public reducersMap: StoreReducersMap;

  constructor() {
    this.reducersMap = {};

    this.store = createReduxStore<StoreState, StoreAction, {}, {}>(
      (state: StoreState = {}) => state,
      devToolsEnhancer({
        /*
          Redux Devtools hot reload causes some bugs due to its state recomputation.
          The tradeoff of disabling Redux Devtools hot reload support is that if you change a reducer,
          you'll lose all Redux Devtools action and state history.
        */
        shouldHotReload: false,
      }),
    );
  }

  combineInternalReducersMap() {
    const combinedReducer = combineReducers(this.reducersMap) as RootReducer;

    const rootReducer: RootReducer = (stateArg, action) => {
      let state = stateArg;

      if (action.type === MAIN_API_SESSION_LOGOUT) {
        state = undefined;
      }

      return combinedReducer(state, action);
    };

    return rootReducer;
  }

  loadReducersMap(reducersMapToLoad: Partial<StoreReducersMap>) {
    let thereAreChangesToMerge = false;
    const changes: Partial<StoreReducersMap> = {};

    for (const keyArg in reducersMapToLoad) {
      const key = keyArg as keyof StoreReducersMap;

      const reducer = reducersMapToLoad[key];

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!reducer) return;
      else if (reducer === this.reducersMap[key]) return;

      thereAreChangesToMerge = true;

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
      changes[key] = reducer as any;
    }

    if (thereAreChangesToMerge) {
      this.reducersMap = {
        ...this.reducersMap,
        ...changes,
      };

      this.store.replaceReducer(this.combineInternalReducersMap());
    }
  }
}

export function createStoreManager() {
  return new StoreManager();
}

const StoreManagerContext = createContext<StoreManager | null>(null);

export function StoreManagerProvider(props: {
  storeManager: StoreManager;
  children: ReactNode;
}) {
  return (
    <StoreManagerContext.Provider value={props.storeManager}>
      {props.children}
    </StoreManagerContext.Provider>
  );
}

export function useStoreManager(): StoreManager {
  return useContext(StoreManagerContext) || throwError();
}
