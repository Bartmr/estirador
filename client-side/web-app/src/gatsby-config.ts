import { PROJECT_NAME } from '@app/shared/project-details';
import { EnvironmentVariables } from './logic/app-internals/runtime/environment-variables';
import path from 'path';

const hostUrl = EnvironmentVariables.HOST_URL;
const pathPrefix = EnvironmentVariables.PATH_PREFIX;

export const GATSBY_CONFIG = {
  flags: {
    DEV_SSR: true,
  },
  ...(pathPrefix ? { pathPrefix } : {}),
  siteMetadata: {
    siteUrl: hostUrl,
    title: PROJECT_NAME,
  },
  plugins: [
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        sassOptions: {
          includePaths: ['src/components/ui-kit/global-styles/include-path'],
        },
      },
    },
    /*
      Enable these two plugins below when SEO becomes a requirement
    */
    // `gatsby-plugin-sitemap`,
    // 'gatsby-plugin-robots-txt',
    //
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,

    /*
      WARNING:
      do not point a gatsby-source-filesystem instance to the root of the project,
      as it will listen for file changes in Gatsby internal directories like .cache
      and will start looping.
    */
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `src-assets`,
        path: path.join(process.cwd(), 'src', 'assets'),
      },
    },
    // TODO: enable this when the project gets an icon
    // {
    //   resolve: `gatsby-plugin-manifest`,
    //   options: {
    //     name: projectName,
    //     start_url: `${pathPrefix}/`,
    //     background_color: `#ffffff`,
    //     theme_color: `#000000`,
    //     display: `browser`,
    //     icon: "src/assets/vendors/this-project/vendor-icon.png",
    //   },
    // },
    //
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // Must be placed after gatsby-plugin-manifest
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
    {
      resolve: 'gatsby-plugin-webpack-bundle-analyser-v2',
      options: {
        openAnalyzer: !EnvironmentVariables.CI,
        analyzerMode: 'static',
        defaultSizes: 'gzip',
        reportFilename: path.join(
          process.cwd(),
          '.webpack-bundle-analyzer',
          'report.html',
        ),
      },
    },
  ],
};
