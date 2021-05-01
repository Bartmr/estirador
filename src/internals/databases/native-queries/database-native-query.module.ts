import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { LoggingService } from 'src/internals/logging/logging.service';
import { DatabaseNativeQueryService } from './database-native-query.service';
import { Client } from 'pg';
import { LoggingModule } from 'src/internals/logging/logging.module';
import { generateRandomUUID } from 'src/internals/utils/generate-random-uuid';

// avoid provider token colisions by using a generated string
const POSTGRES_CLIENT_KEY = `POSTGRES_CLIENT_KEY_${generateRandomUUID()}`;

@Module({
  imports: [LoggingModule],
  exports: [DatabaseNativeQueryService],
  providers: [
    {
      provide: POSTGRES_CLIENT_KEY,
      useFactory: async () => {
        const client = new Client({
          host: EnvironmentVariablesService.variables.DATABASE_HOST,
          port: EnvironmentVariablesService.variables.DATABASE_PORT,
          database: EnvironmentVariablesService.variables.DATABASE_NAME,
          user: EnvironmentVariablesService.variables.DATABASE_USER,
          password: EnvironmentVariablesService.variables.DATABASE_PASSWORD,
        });

        await client.connect();

        return client;
      },
    },
    {
      provide: DatabaseNativeQueryService,
      inject: [POSTGRES_CLIENT_KEY, LoggingService],
      useFactory: (client: Client, loggingService: LoggingService) => {
        return new DatabaseNativeQueryService(client, loggingService);
      },
    },
  ],
})
export class DatabaseNativeQueryModule implements OnApplicationShutdown {
  constructor(
    @Inject(POSTGRES_CLIENT_KEY)
    private client: Client,
  ) {}

  async onApplicationShutdown() {
    await this.client.end();
  }
}
