import path from 'path';

import { NextConfig } from 'next';
import { EnvironmentVariables } from './logic/app-internals/runtime/environment-variables';

export const NEXT_CONFIG: NextConfig = {
  webpack: (config: {
    resolve: {
      alias: {
        [key: string]: string;
      };
    };
  }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      typeorm: path.join(
        process.cwd(),
        '../../node_modules/typeorm/typeorm-model-shim.js',
      ),
      '@app/shared': EnvironmentVariables.CI
        ? path.join(process.cwd(), 'dist/libs/shared/src')
        : path.join(process.cwd(), '../../libs/shared/src'),
    };
    return config;
  },
  sassOptions: {
    includePaths: [
      path.join(
        process.cwd(),
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
