import { ConnectionOptions } from 'typeorm-bartmr';
import { ALL_MIGRATIONS } from './all-migrations';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from './default-db-typeorm-conn-opts';

export const DEFAULT_DB_TYPEORM_CONN_OPTS_WITH_MIGRATIONS = {
  ...DEFAULT_DB_TYPEORM_CONN_OPTS,
  migrations: ALL_MIGRATIONS,
  cli: {
    migrationsDir: 'src/internals/databases/migrations',
  },
};

export const TYPEORM_ORMCONFIG_WITH_MIGRATIONS: ConnectionOptions[] = [
  DEFAULT_DB_TYPEORM_CONN_OPTS_WITH_MIGRATIONS,
];
