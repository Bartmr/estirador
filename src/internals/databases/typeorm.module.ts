import {
  DynamicModule,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
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

@Injectable()
class TypeormConnectionsService implements OnApplicationShutdown {
  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = new ConnectionManager();
  }

  getConnectionManager() {
    return this.connectionManager;
  }

  async onApplicationShutdown(): Promise<void> {
    const connections = this.connectionManager.connections;

    await Promise.all(connections.map((connection) => connection.close()));
  }
}

export class TypeormConnectionsModule {
  static forRoot(allConnectionOptions: ConnectionOptions[]): DynamicModule {
    const connectionNameSchema = equals(getEnumValues(TypeormConnectionName))
      .notNull()
      .transform((v) => v ?? TypeormConnectionName.Default);

    return {
      module: TypeormConnectionsModule,
      global: true,
      providers: [
        TypeormConnectionsService,
        ...allConnectionOptions.map((options) => {
          const connectionNameRes = connectionNameSchema.validate(options.name);

          if (connectionNameRes.errors) {
            throw new Error();
          }

          const connectionName = connectionNameRes.value;

          return {
            provide: getTypeormConnectionProviderToken(connectionName),
            useFactory: async (
              typeormConnectionsService: TypeormConnectionsService,
            ): Promise<Connection> => {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              const metadata = metadataStorage[connectionName] || throwError();

              const connectionManager =
                typeormConnectionsService.getConnectionManager();

              const connection = connectionManager.create({
                ...options,
                entities: Object.values(metadata.entities),
              });

              return connection.connect();
            },
            inject: [TypeormConnectionsService],
          };
        }),
      ],
      exports: allConnectionOptions.map((options) => {
        const connectionNameRes = connectionNameSchema.validate(options.name);

        if (connectionNameRes.errors) {
          throw new Error();
        }

        const connectionName = connectionNameRes.value;

        return getTypeormConnectionProviderToken(connectionName);
      }),
    };
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
