import { ConnectionOptions } from 'typeorm';
import { ALL_MIGRATIONS } from './all-migrations';
import { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS as defaultDatabaseOptions } from './default-database-typeorm-connection-options';

export const DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS = {
  ...defaultDatabaseOptions,
  migrations: ALL_MIGRATIONS,
  cli: {
    migrationsDir: 'src/internals/databases/migrations',
  },
};

export const TYPEORM_ORMCONFIG_WITH_MIGRATIONS: ConnectionOptions[] = [
  DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
];
