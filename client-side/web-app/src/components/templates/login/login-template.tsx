import { useState } from 'react';
import { AuthenticatedRouteAccess } from 'src/components/routing/authenticated-route/authenticated-route-types';
import { Page } from 'src/components/routing/page/page';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { LOGIN_ROUTE } from './login-routes';
import { useForm } from 'react-hook-form';
import { UncompletedFormValue } from 'src/logic/app-internals/forms/uncompleted-form-types';
import {
  TransportedDataGate,
  TransportedDataGateLayout,
} from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useMainApiSession } from 'src/logic/app-internals/apis/main/session/use-main-api-session';
import { isTransportFailure } from 'src/logic/app-internals/transports/transported-data/is-transport-failure';
import { INDEX_ROUTE } from '../index/index-routes';
import { navigate } from 'gatsby';

type LoginFormValue = { email: string; password: string };
type UncompleteLoginFormValue = UncompletedFormValue<LoginFormValue, true>;

function Content() {
  const apiSession = useMainApiSession();

  const [submissionStatus, replaceSubmissionStatus] = useState<
    TransportedData<'wrong-credentials'>
  >({
    status: TransportedDataStatus.NotInitialized,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UncompleteLoginFormValue>();
  const onSubmit = async (data: LoginFormValue) => {
    replaceSubmissionStatus({
      status: TransportedDataStatus.Loading,
    });

    const res = await apiSession.login(data);

    if (isTransportFailure(res)) {
      return replaceSubmissionStatus({ status: res });
    } else if (res === 'wrong-credentials') {
      return replaceSubmissionStatus({
        status: TransportedDataStatus.Done,
        data: res,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate(INDEX_ROUTE.getHref());
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email-input">Email address</label>
          <input
            {...register('email', { required: true })}
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            id="email-input"
          />
          <div className="invalid-feedback">Email is required</div>
        </div>
        <div className="form-group">
          <label htmlFor="password-input">Password</label>
          <input
            {...register('password', { required: true })}
            type="password"
            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
            id="password-input"
          />
          <div className="invalid-feedback">Password is required</div>
        </div>
        <div className="d-flex align-items-center">
          <button
            disabled={submissionStatus.status === TransportedDataStatus.Loading}
            type={'submit'}
            className="btn btn-default mr-4"
          >
            Login
          </button>
          <TransportedDataGate
            layout={TransportedDataGateLayout.Tape}
            dataWrapper={submissionStatus}
          >
            {() => {
              return <span className="text-danger">Wrong Credentials</span>;
            }}
          </TransportedDataGate>
        </div>
      </form>
    </>
  );
}

export function LoginTemplate() {
  return (
    <Page
      title={LOGIN_ROUTE.label}
      authenticationRules={{
        mainApiSession: { access: AuthenticatedRouteAccess.Block },
      }}
    >
      {() => {
        return <Content />;
      }}
    </Page>
  );
}
