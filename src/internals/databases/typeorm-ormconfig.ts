import { ConnectionOptions } from 'typeorm';
import { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } from './default-database-typeorm-connection-options';

export const TYPEORM_ORMCONFIG: ConnectionOptions[] = [
  DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
];
