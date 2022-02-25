import React, { FunctionComponent, useEffect, useState } from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { StateProvider } from './components/state-provider';
import { dom } from '@fortawesome/fontawesome-svg-core';
import Head from 'next/head';

type NextJSProps = {
  Component: FunctionComponent<{ [key: string]: unknown }>;
  pageProps: { [key: string]: unknown };
};

const FatalErrorFrame = () => {
  return (
    <div className="vh-100 bg-primary">
      <div className="h-75 d-flex flex-column justify-content-center align-items-center">
        <FontAwesomeIcon
          className={`icon-thumbnail mb-4`}
          icon={faExclamationCircle}
        />
        <h2>Internal Error</h2>
        <p className="lead">
          An internal error occured. Please refresh the page and try again.
        </p>
      </div>
    </div>
  );
};

type ErrorBoundaryProps = {};
type ErrorBoundaryState = { fatalErrorOccurred: boolean };
class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { fatalErrorOccurred: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { fatalErrorOccurred: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    Logger.logError('root-frame-error-boundary', error, { errorInfo });
  }

  render() {
    if (this.state.fatalErrorOccurred) {
      return <FatalErrorFrame />;
    }

    return <>{this.props.children}</>;
  }
}

export const UncaughtErrorHandler = (props: NextJSProps) => {
  const [fatalErrorOccurred, replaceFatalErrorOccurredFlag] = useState(false);

  useEffect(() => {
    /*
      The logger module is already logging these exceptions.
      It attaches listeners in its initialization.

      These listeners here are just for showing a warning to the user
    */
    const unhandledPromiseRejectionHandler = () => {
      replaceFatalErrorOccurredFlag(true);
    };

    const uncaughtExceptionHandler = () => {
      replaceFatalErrorOccurredFlag(true);
    };

    window.addEventListener(
      'unhandledrejection',
      unhandledPromiseRejectionHandler,
    );
    window.addEventListener('error', uncaughtExceptionHandler);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        unhandledPromiseRejectionHandler,
      );
      window.removeEventListener('error', uncaughtExceptionHandler);
    };
  }, []);

  const Component = props.Component;

  if (EnvironmentVariables.DISABLE_ERROR_BOUNDARIES) {
    return (
      <StateProvider>
        <Component {...props.pageProps} />
      </StateProvider>
    );
  } else {
    if (fatalErrorOccurred) {
      return <FatalErrorFrame />;
    } else {
      return (
        <ErrorBoundary>
          <StateProvider>
            <Component {...props.pageProps} />
          </StateProvider>
        </ErrorBoundary>
      );
    }
  }
};

export const _RootFrameImpl = (props: NextJSProps) => {
  return (
    <>
      <Head>
        <style>{dom.css()}</style>
      </Head>
      <UncaughtErrorHandler {...props} />
    </>
  );
};
