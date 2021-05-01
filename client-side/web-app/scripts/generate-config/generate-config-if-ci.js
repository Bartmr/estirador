const { promisify } = require('util');
const childProcess = require('child_process');

const {
  boolean,
} = require('@opplane/not-me/lib/schemas/boolean/boolean-schema');

const exec = promisify(childProcess.exec);

const CI = boolean().validate(process.env.CI);

if (CI.errors) {
  console.error(`Invalid CI environment variable: ${process.env.CI}`);
  throw new Error();
}

const isCI = CI.value;

async function run() {
  if (isCI) {
    await exec('npm run generate:config:release');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
