const path = require('path');
const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => {
  return {
    webpack: (config, options) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        typeorm: path.join(
          __dirname,
          '../../node_modules/typeorm/typeorm-model-shim.js',
        ),
        '@app/shared': path.join(
          __dirname,
          // Bypass grep search for imports pointing to outside the project
          '../../' + 'libs/shared/src',
        ),
        '@config': path.join(
          __dirname,
          `__config.${
            phase === PHASE_DEVELOPMENT_SERVER ? 'debug' : 'release'
          }`,
        ),
      };
      return config;
    },
    sassOptions: {
      includePaths: [
        path.join(
          __dirname,
          'src/components/ui-kit/global-styles/include-path',
        ),
      ],
    },
    experimental: {
      // https://github.com/vercel/next.js/issues/9474
      externalDir: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
  };
};
