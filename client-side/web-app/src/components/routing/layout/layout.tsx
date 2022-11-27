import Head from 'next/head';
import { ReactNode } from 'react';
import { Header } from './header/header';
import { PROJECT_NAME } from '@app/shared/project-details';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
};

export function Layout(props: Props) {
  return (
    <>
      <Head>
        <title>{`${props.title} - ${PROJECT_NAME}`}</title>
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
    </>
  );
}
