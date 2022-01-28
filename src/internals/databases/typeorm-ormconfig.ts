import { ConnectionOptions } from 'typeorm-bartmr';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from './default-db-typeorm-conn-opts';

export const TYPEORM_ORMCONFIG: ConnectionOptions[] = [
  DEFAULT_DB_TYPEORM_CONN_OPTS,
];
