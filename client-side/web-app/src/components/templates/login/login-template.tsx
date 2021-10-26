import { Fragment, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from 'src/components/routing/layout/layout';
import { notMeReactHookFormResolver } from 'src/logic/app-internals/forms/not-me-react-hook-form-resolver';
import { LOGIN_ROUTE } from './login-routes';
import { loginRequestSchema } from '@app/shared/auth/auth.schemas';
import { useFormUtils } from 'src/logic/app-internals/forms/form-utils';
import { useMainApiSession } from 'src/logic/app-internals/apis/main/session/use-main-api-session';
import { useEffect } from 'react';
import { TransportedDataGate } from 'src/components/shared/transported-data-gate/transported-data-gate';
import { useStoreSelector } from 'src/logic/app-internals/store/use-store-selector';
import { mainApiReducer } from 'src/logic/app-internals/apis/main/main-api-reducer';
import { navigate } from 'gatsby-link';
import { INDEX_ROUTE } from '../index/index-routes';
import {
  TransportedData,
  TransportedDataStatus,
} from 'src/logic/app-internals/transports/transported-data/transported-data-types';
import { isTransportFailure } from 'src/logic/app-internals/transports/transported-data/is-transport-failure';

function Form() {
  const mainApiSession = useMainApiSession();

  const form = useForm({
    resolver: notMeReactHookFormResolver(loginRequestSchema),
  });

  const formUtils = useFormUtils(form);

  const [loginResult, replaceLoginResult] = useState<
    TransportedData<'wrong-credentials' | 'ok'>
  >({ status: TransportedDataStatus.NotInitialized });

  return (
    <>
      <TransportedDataGate dataWrapper={loginResult}>
        {({ data }) => {
          if (data === 'wrong-credentials') {
            return (
              <div className="alert alert-danger" role="alert">
                You have an incorrect email or password
              </div>
            );
          } else {
            return null;
          }
        }}
      </TransportedDataGate>
      <div className="card">
        <div className="card-body">
          <form
            onSubmit={form.handleSubmit(async (data) => {
              replaceLoginResult({
                status: TransportedDataStatus.Loading,
              });

              const res = await mainApiSession.login(data);

              if (isTransportFailure(res)) {
                replaceLoginResult({
                  status: res,
                });
              } else {
                replaceLoginResult({
                  status: TransportedDataStatus.Done,
                  data: res,
                });
              }
            })}
            noValidate
          >
            <div className="form-group">
              <label htmlFor="email-input">Email address</label>
              <input
                {...form.register('email')}
                type="email"
                className={`form-control ${
                  formUtils.hasErrors('email') ? 'is-invalid' : ''
                }`}
                id="email-input"
              />
              <div className="invalid-feedback">
                {Object.entries(formUtils.getErrorTypesFromField('email')).map(
                  (c) => {
                    return (
                      <Fragment key={c[0]}>
                        {c[1]} <br />
                      </Fragment>
                    );
                  },
                )}
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password-input">Password</label>
              <input
                {...form.register('password')}
                type="password"
                className={`form-control ${
                  formUtils.hasErrors('password') ? 'is-invalid' : ''
                }`}
                id="password-input"
              />
              <div className="invalid-feedback">
                {Object.entries(
                  formUtils.getErrorTypesFromField('password'),
                ).map((c) => {
                  return (
                    <Fragment key={c[0]}>
                      {c[1]} <br />
                    </Fragment>
                  );
                })}
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="col-12 col-md-4">
                <button
                  disabled={
                    loginResult.status === TransportedDataStatus.Loading
                  }
                  type="submit"
                  className="btn-block btn btn-primary"
                >
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function LoggedIn(props: { nextUrl: string | null }) {
  useEffect(() => {
    (async () => {
      await navigate(props.nextUrl || INDEX_ROUTE.getHref());
    })();
  }, []);

  return null;
}

export function LoginTemplate() {
  const session = useStoreSelector(
    { mainApi: mainApiReducer },
    (s) => s.mainApi.session,
  );

  return (
    <Layout title={LOGIN_ROUTE.label}>
      {() => (
        <TransportedDataGate dataWrapper={session}>
          {({ data }) => {
            const urlSeachParams = new URLSearchParams(window.location.search);

            const unparsedNextUrl = urlSeachParams.get('next');
            const nextUrl = unparsedNextUrl
              ? decodeURIComponent(unparsedNextUrl)
              : null;

            if (data == null) {
              return <Form />;
            } else {
              return <LoggedIn nextUrl={nextUrl} />;
            }
          }}
        </TransportedDataGate>
      )}
    </Layout>
  );
}
