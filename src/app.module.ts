import { Module } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_DB_TYPEORM_CONN_OPTS } from './internals/databases/default-db-typeorm-conn-opts';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    LoggingModule.forRoot(() => LoggingServiceSingleton.getInstance()),
    TypeOrmModule.forRoot({
      ...DEFAULT_DB_TYPEORM_CONN_OPTS,
      autoLoadEntities: true,
    }),
    AuthModule,
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule {}
