import Sequencer from '@jest/test-sequencer';
import { Test } from 'jest-runner';

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
    return copyTests.sort((testA, testB) => (testA.path > testB.path ? -1 : 1));
  }
}
