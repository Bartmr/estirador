import { Module } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from './internals/databases/default-db-typeorm-conn-opts';
import { AuthModule } from './auth/auth.module';
import { TypeormConnectionsModule } from './internals/databases/typeorm.module';

@Module({
  imports: [
    LoggingModule.forRoot(() => LoggingServiceSingleton.getInstance()),
    TypeormConnectionsModule.forRoot([DEFAULT_DB_TYPEORM_CONN_OPTS]),
    AuthModule,
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule {}
