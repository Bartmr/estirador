import { Reducer } from 'redux';

export type StoreReducersMap = Partial<{
  sampleReducer: Reducer<unknown>;
}>;
