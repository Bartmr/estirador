import { Logger } from 'src/logic/app-internals/logging/logger';

export function missingCssClass() {
  Logger.logError('missing-css-class', new Error());

  return '';
}
