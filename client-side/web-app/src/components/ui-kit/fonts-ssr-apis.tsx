import { PreRenderHTMLArgs } from 'gatsby';
import React from 'react';

export const attachFontsProviders = ({
  getPostBodyComponents,
  replacePostBodyComponents,
}: PreRenderHTMLArgs) => {
  const elements = getPostBodyComponents();

  replacePostBodyComponents([
    ...elements,
    <link
      key={'fonts-googleapis-preconnect'}
      rel="preconnect"
      href="https://fonts.googleapis.com"
    />,
    <link
      key={'fonts-gstatic-preconnect'}
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />,
    <link
      key={'font1-stylesheet'}
      href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap"
      rel="stylesheet"
    />,
  ]);
};
