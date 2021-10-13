import { SetMetadata } from '@nestjs/common';

export type PublicRouteMetadata = undefined | boolean;

export const PUBLIC_ROUTE_METADATA_KEY = 'publicRoute';

export const PublicRoute = () => {
  const metadata: PublicRouteMetadata = true;

  return SetMetadata(PUBLIC_ROUTE_METADATA_KEY, metadata);
};
