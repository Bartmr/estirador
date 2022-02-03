import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';

export enum TransportedDataStatus {
  NotInitialized = 'not-initialized',
  // Loading is for data that is not available or should not be used when loading or updating
  Loading = 'loading',
  Done = 'done',
  // Refreshing is for data that can still be used while it's being updated
  Refreshing = 'refreshing',
  //
  // Errors related to a connection failure are tagged using TransportFailure enum
}

export type TransportedData<Data> = Readonly<
  | {
      status: TransportedDataStatus.NotInitialized;
      data?: undefined;
    }
  | {
      status: TransportedDataStatus.Loading;
      data?: undefined;
    }
  | {
      status: TransportedDataStatus.Done;
      data: Data;
    }
  | {
      status: TransportedDataStatus.Refreshing;
      data: Data;
    }
  | {
      status: TransportFailure;
      data?: Data;
    }
>;

export type UnwrapTransportedData<T extends TransportedData<unknown>> =
  T extends {
    status: TransportedDataStatus.Done;
    data: infer U;
  }
    ? U
    : /*
    Discard all other TransportedData states
    that may not have any data
  */
      never;
