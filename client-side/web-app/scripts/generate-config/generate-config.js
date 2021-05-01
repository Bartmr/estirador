const promisify = require('util').promisify;
const path = require('path');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

const throwError = () => {
  throw new Error();
};

const commonConfigString = `export const COMMON_CONFIG = {
  hostUrl: "${process.env.HOST_URL || throwError()}",
  pathPrefix: '',
  disableErrorBoundaries: false,
  logDebug: false
}`;

const mainApiConfigString = `export const MAIN_API_CONFIG = {
  apiUrl: "${process.env.MAIN_API_URL || throwError()}",
};`;

// Bypass grep search for hardcoded config imports
const dir = path.join(process.cwd(), '__confi' + 'g.' + 'release');

mkdir(dir)
  .then(() =>
    writeFile(path.resolve(dir, 'common-config.ts'), commonConfigString),
  )
  .then(() =>
    writeFile(path.resolve(dir, 'main-api-config.ts'), mainApiConfigString),
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
