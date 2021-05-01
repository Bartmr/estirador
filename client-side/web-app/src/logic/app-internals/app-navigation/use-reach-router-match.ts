import { useMatch } from '@reach/router';
import { COMMON_CONFIG } from '@config/common-config';

export function useReachRouterMatch(path: string) {
  return useMatch(COMMON_CONFIG.pathPrefix + path);
}
