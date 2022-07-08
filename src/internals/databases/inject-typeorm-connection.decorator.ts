import { Inject } from '@nestjs/common';
import { TypeormConnectionName } from './typeorm-connection-names';

export const getTypeormConnectionProviderToken = (
  connectionName: TypeormConnectionName,
) => {
  return `typeorm-module:connection:${connectionName}`;
};

export const InjectTypeormConnection = (
  connection: TypeormConnectionName = TypeormConnectionName.Default,
) => Inject(getTypeormConnectionProviderToken(connection));
