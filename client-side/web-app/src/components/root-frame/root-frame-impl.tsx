import React, {
  FunctionComponent,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Logger } from 'src/logic/app-internals/logging/logger';
import { Provider } from 'react-redux';
import {
  createStoreManager,
  StoreManagerProvider,
} from 'src/logic/app-internals/store/store-manager';
import { RUNNING_IN_CLIENT } from 'src/logic/app-internals/runtime/running-in';
import { EnvironmentVariables } from 'src/logic/app-internals/runtime/environment-variables';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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

type ErrorBoundaryProps = { children: () => ReactNode };
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

    return <>{this.props.children()}</>;
  }
}

const ContentsFrame = (props: { children: ReactNode }) => {
  return <>{props.children}</>;
};

type ModuleHotData = {
  storeManager?: ReturnType<typeof createStoreManager>;
};

const GiveContextToContents = (props: { children: ReactNode }) => {
  const [storeManager] = useState(() => {
    const storeManagerFromPreviousRuntime = (
      module.hot?.data as ModuleHotData | undefined
    )?.storeManager;

    const storeManagerForCurrentRuntime =
      storeManagerFromPreviousRuntime || createStoreManager();

    if (module.hot && RUNNING_IN_CLIENT) {
      module.hot.dispose((data: ModuleHotData) => {
        data.storeManager = storeManagerForCurrentRuntime;
      });
    }

    return storeManagerForCurrentRuntime;
  });

  return (
    <StoreManagerProvider storeManager={storeManager}>
      <Provider store={storeManager.store}>
        <ContentsFrame>{props.children}</ContentsFrame>
      </Provider>
    </StoreManagerProvider>
  );
};

export const _RootFrameImpl = (props: {
  Component: FunctionComponent<{ [key: string]: unknown }>;
  pageProps: { [key: string]: unknown };
}) => {
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
      <GiveContextToContents>
        <Component {...props.pageProps} />
      </GiveContextToContents>
    );
  } else {
    if (fatalErrorOccurred) {
      return <FatalErrorFrame />;
    } else {
      return (
        <ErrorBoundary>
          {() => (
            <GiveContextToContents>
              <Component {...props.pageProps} />
            </GiveContextToContents>
          )}
        </ErrorBoundary>
      );
    }
  }
};
