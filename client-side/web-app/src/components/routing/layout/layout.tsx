import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { AuthenticatedRouteRules } from '../authenticated-route/authenticated-route-types';
import { Header } from './header/header';
import { AuthenticatedRoute } from '../authenticated-route/authenticated-route';
import { GQLLayoutQuery } from './layout._graphql-generated_';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  authenticationRules: AuthenticatedRouteRules | null;
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
        <AuthenticatedRoute authenticationRules={props.authenticationRules}>
          {() => (
            <>
              <main
                className={`flex-fill ${
                  props.noContainment ? '' : 'container'
                } ${props.noTopPadding ? '' : 'pt-3'} ${
                  props.noBottomPadding ? '' : 'pb-3'
                }`}
              >
                {props.children()}
              </main>
              {/* Footer goes here */}
            </>
          )}
        </AuthenticatedRoute>
      </div>
    </>
  );
}
