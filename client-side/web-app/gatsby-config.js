const { isNotCI } = require('./bootstrap-build-environment');
const { COMMON_CONFIG } = require(`@config/common-config`);
const { PROJECT_NAME } = require(`@app/shared/project-details`);
const path = require('path');

function throwError() {
  throw new Error();
}

const projectName = PROJECT_NAME || throwError();

const hostUrl = (() => {
  const hostUrl = COMMON_CONFIG.hostUrl;

  if (
    (hostUrl.startsWith('https://') || hostUrl.startsWith('http://')) &&
    !hostUrl.endsWith('/')
  ) {
    return hostUrl;
  } else {
    throw new Error();
  }
})();

const pathPrefix = (() => {
  const pathPrefix = COMMON_CONFIG.pathPrefix;

  if (
    pathPrefix === '' ||
    (pathPrefix.startsWith('/') && !pathPrefix.endsWith('/'))
  ) {
    return pathPrefix;
  } else {
    throw new Error(
      'Path prefix must be either an empty string, or start with a "/" and also NOT end with a "/"',
    );
  }
})();

module.exports = {
  flags: {
    DEV_SSR: true,
  },
  ...(pathPrefix ? { pathPrefix } : {}),
  siteMetadata: {
    siteUrl: hostUrl,
    title: projectName,
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
        path: `${__dirname}/src/assets`,
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
        openAnalyzer: isNotCI,
        analyzerMode: 'static',
        defaultSizes: 'gzip',
        reportFilename: path.join(
          __dirname,
          '.webpack-bundle-analyzer',
          'report.html',
        ),
      },
    },
  ],
};
