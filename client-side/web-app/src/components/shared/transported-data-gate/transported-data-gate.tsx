import {
  faExclamationCircle,
  faLock,
  faSearch,
  faWifi,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactNode } from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { TransportFailure } from 'src/logic/app-internals/transports/transported-data/transport-failures';
import {
  TransportedData,
  TransportedDataStatus,
  UnwrapTransportedData,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';

export enum TransportedDataGateLayout {
  Tape = 'tape',
  Default = 'default',
  Small = 'small',
}

type Props<T extends TransportedData<unknown>> = {
  layout?: TransportedDataGateLayout;
  dataWrapper: T;
  className?: string;
  children: (props: { data: UnwrapTransportedData<T> }) => ReactNode;
  loadingMessage?: string;
};

export function TransportedDataGate<T extends TransportedData<unknown>>({
  children,
  dataWrapper,
  layout = TransportedDataGateLayout.Default,
  className,
  loadingMessage,
}: Props<T>) {
  const flexClassName = `d-flex ${
    layout === TransportedDataGateLayout.Tape
      ? 'flex-row justify-content-center align-items-center'
      : 'flex-column justify-content-center align-items-center'
  }`;

  const spinnerSizeClass =
    layout === TransportedDataGateLayout.Tape
      ? 'spinner-sm spinner-lg-md'
      : layout === TransportedDataGateLayout.Small
      ? dataWrapper.status === TransportedDataStatus.Refreshing
        ? 'spinner-sm'
        : ''
      : 'spinner-lg';

  const iconSizeClassName =
    layout === TransportedDataGateLayout.Tape ? '' : 'icon-badge';
  const textClassName =
    layout === TransportedDataGateLayout.Tape
      ? 'ms-2'
      : layout === TransportedDataGateLayout.Small
      ? 'small mt-2 text-center'
      : 'mt-3 text-center';

  let gateStatusUI: ReactNode;

  if (dataWrapper.status === TransportedDataStatus.NotInitialized) {
    gateStatusUI = null;
  } else if (dataWrapper.status === TransportedDataStatus.Loading) {
    gateStatusUI = (
      <div className={flexClassName}>
        <div
          className={`d-block ${spinnerSizeClass} spinner-border text-primary`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {loadingMessage ? (
          <p className={`${textClassName} text-primary mb-0`}>
            {loadingMessage}
          </p>
        ) : null}
      </div>
    );
  } else if (dataWrapper.status === TransportedDataStatus.Refreshing) {
    gateStatusUI = (
      <div
        className={`${
          layout === TransportedDataGateLayout.Small ? 'drop-shadow-sm' : ''
        }`}
        style={
          layout === TransportedDataGateLayout.Tape
            ? {
                marginRight: 'var(--spacer-2)',
              }
            : layout === TransportedDataGateLayout.Small
            ? {
                zIndex: 1,
                padding: 'var(--spacer-2)',
                position: 'absolute',
              }
            : {
                zIndex: 1,
                right: 'var(--spacer-3)',
                position: 'fixed',
              }
        }
      >
        <div
          className={`d-block ${spinnerSizeClass} spinner-border text-primary`}
          role="status"
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  } else if (dataWrapper.status === TransportedDataStatus.Done) {
    gateStatusUI = null;
  } else if (dataWrapper.status === TransportFailure.NotFound) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FontAwesomeIcon className={`${iconSizeClassName}`} icon={faSearch} />
        <p className={`${textClassName} font-weight-bold mb-0`}>Not Found</p>
      </div>
    );
  } else if (dataWrapper.status === TransportFailure.ConnectionFailure) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FontAwesomeIcon
          className={`text-danger ${iconSizeClassName}`}
          icon={faWifi}
        />
        <p className={`${textClassName} text-danger mb-0`}>
          No Internet
          {layout === TransportedDataGateLayout.Default
            ? '. Check your connection and try again.'
            : null}
        </p>
      </div>
    );
  } else if (dataWrapper.status === TransportFailure.Forbidden) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FontAwesomeIcon className={`${iconSizeClassName}`} icon={faLock} />
        <p className={`${textClassName} mb-0`}>
          {layout === TransportedDataGateLayout.Default
            ? 'You are not allowed to access this content'
            : 'Not Allowed'}
        </p>
      </div>
    );
  } else if (dataWrapper.status === TransportFailure.AbortedAndDealtWith) {
    gateStatusUI = (
      <div className={flexClassName}>
        <p className={`${textClassName} mb-0`}>Redirecting...</p>
      </div>
    );
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (dataWrapper.status === TransportFailure.UnexpectedResponse) {
    gateStatusUI = (
      <div className={flexClassName}>
        <FontAwesomeIcon
          className={`text-danger ${iconSizeClassName}`}
          icon={faExclamationCircle}
        />
        <p className={`text-danger ${textClassName} mb-0`}>
          {layout === TransportedDataGateLayout.Default
            ? 'An unexpected error occurred. Try again later.'
            : 'Unexpected Error'}
        </p>
      </div>
    );
  } else {
    Logger.logError(
      'unknown-transported-data-status-in-transported-data-gate',
      new Error(),
      {
        dataStatus: (dataWrapper as TransportedData<T>).status,
      },
    );

    gateStatusUI = null;
  }

  const gateContent =
    dataWrapper.status === TransportedDataStatus.Done ||
    dataWrapper.status === TransportedDataStatus.Refreshing
      ? children({ data: dataWrapper.data as UnwrapTransportedData<T> })
      : null;

  return (
    <div
      className={`${
        layout === TransportedDataGateLayout.Tape &&
        dataWrapper.status === TransportedDataStatus.Refreshing
          ? 'd-flex flex-row align-items-center'
          : ''
      } ${className || ''}`}
    >
      <>{gateStatusUI}</>
      <>{gateContent}</>
    </div>
  );
}
