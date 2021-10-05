import { Module, OnModuleInit } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { InjectConnection, TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } from './internals/databases/default-database-typeorm-connection-options';
import { AuthModule } from './auth/auth.module';
import { RemoteConfigModule } from './remote-config/remote-config.module';
import { AuditContext } from './internals/auditing/audit-context';
import { generateUniqueUUID } from '@app/shared/internals/utils/uuid/generate-unique-uuid';
import { ProcessContextManager } from './internals/process/process-context-manager';
import { Connection } from 'typeorm';
import { SettingsRepository } from './settings/typeorm/settings.repository';
import { Settings } from './settings/typeorm/settings.entity';

@Module({
  imports: [
    LoggingModule.forRoot(LoggingServiceSingleton.getInstance()),
    TypeOrmModule.forRoot({
      ...DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Settings]),
    AuthModule,
    RemoteConfigModule,
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  async onModuleInit() {
    const auditContext: AuditContext = {
      operationId: generateUniqueUUID(),
      requestPath: undefined,
      requestMethod: undefined,
      authContext: undefined,
      processId: ProcessContextManager.getContext().id,
    };

    await this.connection
      .getCustomRepository(SettingsRepository)
      .initializeSettings(auditContext);
  }
}
