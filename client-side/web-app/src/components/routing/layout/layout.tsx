import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from './header/header';
import { PROJECT_NAME } from '@app/shared/project-details';
import SSRProvider from 'react-bootstrap/SSRProvider';
import { dom } from '@fortawesome/fontawesome-svg-core';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
};

export function Layout(props: Props) {
  return (
    <SSRProvider>
      <Head>
        <title>
          {props.title} - {PROJECT_NAME}
        </title>
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
          rel="stylesheet"
        />
        <style>{dom.css()}</style>
      </Head>
      <div className="min-vh-100 d-flex flex-column align-items-stretch">
        <Header menuHtmlId="page-header-menu" className="sticky-top" />
        <main
          className={`flex-fill ${props.noContainment ? '' : 'container'} ${
            props.noTopPadding ? '' : 'pt-3'
          } ${props.noBottomPadding ? '' : 'pb-3'}`}
        >
          {props.children()}
        </main>
        {/* TODO: Footer goes here */}
      </div>
    </SSRProvider>
  );
}
