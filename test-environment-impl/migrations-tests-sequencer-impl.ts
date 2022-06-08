import Sequencer from '@jest/test-sequencer';
import { Test } from 'jest-runner';
import { throwError } from 'src/internals/utils/throw-error';

export class MigrationsTestSequencer extends Sequencer {
  sort(tests: Test[]) {
    const copyTests = Array.from(tests);

    /*
      Start testing from most recent migration to oldest migration

      Since there's no need to test migrations that ran successfully in production,
      it is faster to just run the most recent migrations tests with a fully migrated database,
      and for each test run the migration rollback first
      (which in turn will force the developer to also implement a migration rollback)
      and then the migration `up()` method.
    */
    return copyTests.sort((testA, testB) => {
      const testAPathSplit = testA.path.split('/');
      const testAFilename =
        testAPathSplit[testAPathSplit.length - 1] || throwError();
      const testATimestamp = Number(testAFilename.split('-')[0]);

      if (isNaN(testATimestamp)) {
        throw new Error(testA.path);
      }

      const testBPathSplit = testB.path.split('/');
      const testBFilename =
        testBPathSplit[testBPathSplit.length - 1] || throwError();
      const testBTimestamp = Number(testBFilename.split('-')[0]);

      if (isNaN(testBTimestamp)) {
        throw new Error(testB.path);
      }

      return testBTimestamp - testATimestamp;
    });
  }
}
