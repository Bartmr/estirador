import React, { useEffect, useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { makeAccessibleOnClickProps } from 'src/components/ui-kit/core/accessibility/make-accessible-on-click-props';
import * as styles from './header.module.scss';
import { HEADER_CSS_CLASS } from './header-constants';
import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { INDEX_ROUTE } from 'src/components/templates/index/index-routes';
import { Nav } from 'react-bootstrap';
import { PROJECT_NAME } from '@app/shared/project-details';
import { missingCssClass } from 'src/components/ui-kit/core/utils/missing-css-class';
import { HamburguerMenuIcon } from '../../../ui-kit/components/icons/hamburguer-menu-icon';

type Props = {
  menuHtmlId: string;
};

export function Header(props: Props) {
  const [expanded, replaceExpanded] = useState<boolean>(false);

  const expandMenu = () => {
    replaceExpanded(true);
  };

  const collapseMenu = () => {
    replaceExpanded(false);
  };

  useEffect(() => {
    const resizeHandler = () => {
      if (expanded) {
        collapseMenu();
      }
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <>
      <header className={`sticky-top border-bottom ${HEADER_CSS_CLASS}`}>
        <Navbar collapseOnSelect expand="lg" expanded={expanded}>
          <Navbar.Toggle
            onClick={() => {
              if (expanded) {
                collapseMenu();
              } else {
                expandMenu();
              }
            }}
            aria-controls={props.menuHtmlId}
          >
            <HamburguerMenuIcon />
          </Navbar.Toggle>
          <LinkAnchor className="navbar-brand" href={INDEX_ROUTE.getHref()}>
            <span className="badge badge-primary">
              <span className="h5">{PROJECT_NAME}</span>
            </span>
          </LinkAnchor>
          <Navbar.Collapse id={props.menuHtmlId}>
            <div className="container">
              <Nav>
                <li className="nav-item"></li>
              </Nav>
            </div>
          </Navbar.Collapse>
        </Navbar>
      </header>
      {expanded ? (
        <div
          {...makeAccessibleOnClickProps(() => collapseMenu(), 'switch')}
          className={styles['header__backdrop'] || missingCssClass()}
        />
      ) : null}
    </>
  );
}
