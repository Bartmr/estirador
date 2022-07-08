import { DynamicModule, OnApplicationShutdown } from '@nestjs/common';
import { getEnumValues } from 'libs/shared/src/internals/utils/enums/get-enum-values';
import { ConcreteClass } from 'libs/shared/src/internals/utils/types/classes-types';
import { equals } from 'not-me/lib/schemas/equals/equals-schema';
import { Connection, ConnectionManager, ConnectionOptions } from 'typeorm';
import { throwError } from '../utils/throw-error';
import { getTypeormConnectionProviderToken } from './inject-typeorm-connection.decorator';
import { TypeormConnectionName } from './typeorm-connection-names';

type EntityClass = ConcreteClass;

type TypeormConnectionMetadataStorage = {
  [K in TypeormConnectionName]: {
    entities: {
      [key: string]: EntityClass;
    };
  };
};

const metadataStorage: TypeormConnectionMetadataStorage = {
  [TypeormConnectionName.Default]: {
    entities: {},
  },
};
const connectionManager: ConnectionManager = new ConnectionManager();

export class TypeormConnectionsModule implements OnApplicationShutdown {
  static forRoot(allConnectionOptions: ConnectionOptions[]): DynamicModule {
    for (const options of allConnectionOptions) {
      const nameValidation = equals(getEnumValues(TypeormConnectionName))
        .notNull()
        .validate(options.name);

      if (nameValidation.errors) {
        throw new Error();
      }
    }

    return {
      module: TypeormConnectionsModule,
      global: true,
      providers: allConnectionOptions.map((options) => {
        const connectionName = (options.name ??
          TypeormConnectionName.Default) as TypeormConnectionName;

        return {
          provide: getTypeormConnectionProviderToken(connectionName),
          useFactory: async (): Promise<Connection> => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            const metadata = metadataStorage[connectionName] || throwError();

            const connection = connectionManager.create({
              ...options,
              entities: Object.values(metadata.entities),
            });

            return connection.connect();
          },
        };
      }),
      exports: allConnectionOptions.map((options) => {
        const connectionName = (options.name ??
          TypeormConnectionName.Default) as TypeormConnectionName;

        return getTypeormConnectionProviderToken(connectionName);
      }),
    };
  }

  async onApplicationShutdown(): Promise<void> {
    const connections = connectionManager.connections;

    await Promise.all(connections.map((connection) => connection.close()));
  }
}

export class TypeormFeatureModule {
  static forFeature(args: {
    entities: EntityClass[];
    connectionName?: TypeormConnectionName;
  }): DynamicModule {
    for (const entity of args.entities) {
      metadataStorage[
        args.connectionName ?? TypeormConnectionName.Default
      ].entities[entity.name] = entity;
    }

    return {
      module: TypeormFeatureModule,
    };
  }
}
