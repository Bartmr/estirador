const childProcess = require('child_process');
const { promisify } = require('util');

const exec = promisify(childProcess.exec);

const CONFIG_DIRECTORY_NAME = '__config.';

async function lint() {
  await Promise.all([
    (async () => {
      const grepScope = `./src ./type-declarations ./${CONFIG_DIRECTORY_NAME}*`;

      const hardcodedConfigImports = await exec(
        `grep -r "${CONFIG_DIRECTORY_NAME}" ${grepScope} || true`,
      );

      if (hardcodedConfigImports.stdout.trim()) {
        throw new Error(
          `Hardcoded configuration imports were found. Use the "@config" alias instead to import configuration files:\n${hardcodedConfigImports.stdout}`,
        );
      } else if (hardcodedConfigImports.stderr.trim()) {
        throw new Error(hardcodedConfigImports.stderr);
      }
    })(),
  ]);
}

lint().catch((err) => {
  console.error(err);
  process.exit(1);
});
