import 'src/components/ui-kit/global-styles/global-styles';

import { graphql, useStaticQuery } from 'gatsby';
import React, { ReactNode, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { throwError } from 'src/logic/app-internals/utils/throw-error';
import { AuthenticatedRouteRules } from '../authenticated-route/authenticated-route-types';
import { Header } from './header/header';
import { AuthenticatedRoute } from '../authenticated-route/authenticated-route';
import { HEADER_CSS_CLASS } from './header/header-constants';
import { GQLPageQuery } from './page._graphql-generated_';

type Props = {
  children: () => ReactNode;
  title: string;
  noContainment?: boolean;
  noTopPadding?: boolean;
  noBottomPadding?: boolean;
  authenticationRules: AuthenticatedRouteRules | null;
};

function hashChangeHandler(delay: number = 0) {
  if (window.location.hash) {
    setTimeout(() => {
      const targetEl = document.querySelector(window.location.hash);
      const headerEl = document.querySelector(`.${HEADER_CSS_CLASS}`);

      if (targetEl instanceof HTMLElement && headerEl instanceof HTMLElement) {
        window.scrollTo(
          window.scrollX,
          targetEl.offsetTop - headerEl.offsetHeight,
        );
      }
    }, delay);
  }
}

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

  useEffect(() => {
    /*
      This extra delay is to help the user locate himself
      before the page starts scrolling to its target position
    */
    hashChangeHandler(1000);

    const handler = () => hashChangeHandler();

    window.addEventListener('hashchange', handler);

    return () => {
      window.removeEventListener('hashchange', handler);
    };
  }, []);

  const siteMetadata = site?.siteMetadata || throwError();
  const siteTitle = '%s | ' + (siteMetadata.title || throwError());
  const siteBuildDate = site?.buildTime ?? throwError();

  return (
    <>
      <Helmet
        htmlAttributes={{
          lang: 'en',
        }}
        title={props.title}
        titleTemplate={siteTitle}
      />
      <span className="d-none">{`Build date: ${siteBuildDate}`}</span>
      <div className="d-flex flex-column min-vh-100">
        <Header menuHtmlId="page-header-menu" />
        <div
          className={`flex-fill d-flex flex-row ${
            props.noContainment ? '' : 'container'
          } ${props.noTopPadding ? '' : 'pt-3'} ${
            props.noBottomPadding ? '' : 'pb-3'
          }`}
        >
          <AuthenticatedRoute authenticationRules={props.authenticationRules}>
            {() => <main className="w-100 flex-fill">{props.children()}</main>}
          </AuthenticatedRoute>
        </div>
      </div>
    </>
  );
}
