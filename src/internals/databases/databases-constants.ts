import { EnvironmentVariablesService } from '../environment/environment-variables.service';

export const HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS =
  EnvironmentVariablesService.variables
    .HOT_RELOAD_DATABASE_MIGRATIONS_ROLLBACK_STEPS;

export const LOG_DATABASES =
  EnvironmentVariablesService.variables.LOG_DATABASES;

export const TYPEORM_DEFAULT_CONNECTION_NAME = 'default';
