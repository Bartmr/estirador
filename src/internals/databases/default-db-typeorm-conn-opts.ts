import { ConnectionOptions } from 'typeorm';
import { EnvironmentVariablesService } from '../environment/environment-variables.service';
import { ALL_SUBSCRIBERS } from './all-subscribers';
import { LOG_DATABASES } from './databases-constants';

export const DEFAULT_DB_TYPEORM_CONN_OPTS: ConnectionOptions = {
  type: 'postgres' as const,
  host: EnvironmentVariablesService.variables.DATABASE_HOST,
  port: EnvironmentVariablesService.variables.DATABASE_PORT,
  username: EnvironmentVariablesService.variables.DATABASE_USER,
  password: EnvironmentVariablesService.variables.DATABASE_PASSWORD,
  database: EnvironmentVariablesService.variables.DATABASE_NAME,
  subscribers: ALL_SUBSCRIBERS,
  synchronize: false,
  logging: LOG_DATABASES,
  /*
    Migrations should be explicitly run by the CLI,
    or called manually, like when testing or hot reloading migrations.

    This is in order to avoid importing migrations (and with it, their module trees)
    into the API runtime when not needed (specially important in production).
  */
  migrationsRun: false,
};
