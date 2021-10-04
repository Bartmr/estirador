import {
  faExclamationCircle,
  faSearch,
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
  Tape = 't',
  Default = 'd',
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
  layout,
  className,
  loadingMessage,
}: Props<T>) {
  const flexClassName = `${
    /*
      If className exists, a wrapping div is created,
      and the inner content must expand to its size
    */
    className ? 'h-100' : ''
  } d-flex ${
    layout === TransportedDataGateLayout.Tape
      ? 'flex-row justify-content-center align-items-center'
      : 'flex-column justify-content-center align-items-center'
  }`;
  const spinnerSizeClass =
    layout === TransportedDataGateLayout.Tape
      ? 'spinner-default'
      : 'spinner-lg';
  const spinnerPaddingClass =
    layout === TransportedDataGateLayout.Tape ? '' : 'p-3';

  const iconSizeClassName =
    layout === TransportedDataGateLayout.Tape ? '' : 'icon-thumbnail';
  const textClassName = `${
    layout === TransportedDataGateLayout.Tape ? 'ml-2' : 'mt-3 h4'
  }`;

  const gateContent = (() => {
    switch (dataWrapper.status) {
      case TransportedDataStatus.NotInitialized:
        return <div />;
      case TransportedDataStatus.Loading:
        return (
          <div className={flexClassName}>
            <div
              className={`w-auto ${spinnerPaddingClass}`}
              style={{ position: 'relative', zIndex: 1 }}
            >
              <div
                className={`${spinnerSizeClass} spinner-border text-primary`}
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            {loadingMessage ? (
              <p className={`${textClassName} text-primary mb-0`}>
                {loadingMessage}
              </p>
            ) : null}
          </div>
        );
      case TransportedDataStatus.Refreshing:
        return (
          <>
            <div
              className={`w-auto ${spinnerPaddingClass}`}
              style={{
                zIndex: 1,
                right: 'var(--spacer-3)',
                marginTop: 'var(--spacer-3)',
                position: 'fixed',
              }}
            >
              <div
                className={`${spinnerSizeClass} spinner-border text-primary`}
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
            </div>
            {children({ data: dataWrapper.data as UnwrapTransportedData<T> })}
          </>
        );

      case TransportedDataStatus.Done:
        return (
          <>
            {children({ data: dataWrapper.data as UnwrapTransportedData<T> })}
          </>
        );
      case TransportFailure.NotFound:
        return (
          <div className={flexClassName}>
            <FontAwesomeIcon
              className={`text-primary ${iconSizeClassName}`}
              icon={faSearch}
            />
            <p
              className={`${textClassName} text-primary font-weight-bold mb-0`}
            >
              404 Not Found
            </p>
          </div>
        );
      case TransportFailure.ConnectionFailure:
        return (
          <div className={flexClassName}>
            <FontAwesomeIcon
              className={`text-danger ${iconSizeClassName}`}
              icon={faExclamationCircle}
            />
            <p className={`${textClassName} text-danger mb-0`}>
              Connection Error
            </p>
          </div>
        );
      case TransportFailure.Forbidden:
        return (
          <div className={flexClassName}>
            <FontAwesomeIcon
              className={`text-danger ${iconSizeClassName}`}
              icon={faExclamationCircle}
            />
            <p className={`${textClassName} text-danger mb-0`}>
              You cannot access this content
            </p>
          </div>
        );
      case TransportFailure.AbortedAndDealtWith:
        return (
          <div className={flexClassName}>
            <p className={`${textClassName} mb-0`}>Redirecting...</p>
          </div>
        );
      case TransportFailure.UnexpectedResponse:
        return (
          <div className={flexClassName}>
            <FontAwesomeIcon
              className={`text-danger ${iconSizeClassName}`}
              icon={faExclamationCircle}
            />
            <p className={`text-danger ${textClassName} mb-0`}>
              An internal error occurred. Try again later.
            </p>
          </div>
        );
      default:
        Logger.logError(
          'unknown-transported-data-status-in-transported-data-gate',
          new Error(),
          {
            dataStatus: (dataWrapper as TransportedData<T>).status,
          },
        );

        return <div />;
    }
  })();

  return className ? (
    <div className={className}>{gateContent}</div>
  ) : (
    gateContent
  );
}
