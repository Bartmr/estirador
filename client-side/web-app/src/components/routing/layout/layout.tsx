import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { Header } from './header/header';
import { GQLLayoutQuery } from './layout._graphql-generated_';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
};

export function Layout(props: Props) {
  const { site } = useStaticQuery<GQLLayoutQuery>(graphql`
    query Layout {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);

  const siteMetadata = site?.siteMetadata || throwError();
  const siteTitle = siteMetadata.title || throwError();

  const title = `${props.title} - ${siteTitle}`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div className="min-vh-100 d-flex flex-column align-items-stretch">
        <Header menuHtmlId="page-header-menu" className="sticky-top" />
        <main
          className={`flex-fill ${props.noContainment ? '' : 'container'} ${
            props.noTopPadding ? '' : 'pt-3'
          } ${props.noBottomPadding ? '' : 'pb-3'}`}
        >
          {props.children()}
        </main>
        {/* Footer goes here */}
      </div>
    </>
  );
}
