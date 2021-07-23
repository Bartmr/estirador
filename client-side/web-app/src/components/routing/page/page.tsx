import Head from 'next/head';
import { ReactNode } from 'react';
import { AuthenticatedRouteRules } from '../authenticated-route/authenticated-route-types';
import { Header } from './header/header';
import { AuthenticatedRoute } from '../authenticated-route/authenticated-route';
import { PROJECT_NAME } from '@app/shared/project-details';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  authenticationRules: AuthenticatedRouteRules | null;
};

export function Page(props: Props) {
  return (
    <>
      <Head>
        <title>
          {props.title} - {PROJECT_NAME}
        </title>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,600;0,700;0,800;1,300;1,400;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        ,
      </Head>
      <div
        className="d-flex flex-column"
        style={{ minHeight: '100vh', maxHeight: '100vh' }}
      >
        <Header menuHtmlId="page-header-menu" />
        <div className={`flex-fill w-100 max-h-100 overflow-y-auto d-flex`}>
          <AuthenticatedRoute authenticationRules={props.authenticationRules}>
            {() => (
              <main
                className={`w-100 flex-fill ${
                  props.noContainment ? '' : 'container'
                } ${props.noTopPadding ? '' : 'pt-3'} ${
                  props.noBottomPadding ? '' : 'pb-3'
                }`}
              >
                {props.children()}
              </main>
            )}
          </AuthenticatedRoute>
        </div>
      </div>
    </>
  );
}
