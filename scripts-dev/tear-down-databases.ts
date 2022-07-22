import 'src/internals/environment/load-environment-variables';

import { tearDownDatabases } from 'test-environment-impl/base/tear-down-databases';

tearDownDatabases()
  .then((connections) =>
    Promise.all(connections.map((connection) => connection.close())),
  )
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
