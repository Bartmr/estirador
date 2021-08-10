import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { AuthenticatedRouteRules } from '../authenticated-route/authenticated-route-types';
import { Header } from './header/header';
import { AuthenticatedRoute } from '../authenticated-route/authenticated-route';
import { GQLPageQuery } from './page._graphql-generated_';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  authenticationRules: AuthenticatedRouteRules | null;
};

export function Page(props: Props) {
  const { site } = useStaticQuery<GQLPageQuery>(graphql`
    query Page {
      site {
        buildTime
        siteMetadata {
          title
        }
      }
    }
  `);

  const siteMetadata = site?.siteMetadata || throwError();
  const siteTitle = '%s | ' + (siteMetadata.title || throwError());
  const siteBuildDate = site?.buildTime ?? throwError();

  return (
    <>
      <Helmet title={props.title} titleTemplate={siteTitle} />
      <span className="d-none">{`Build date: ${siteBuildDate}`}</span>
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
