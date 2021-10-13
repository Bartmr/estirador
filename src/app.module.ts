import { Module } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } from './internals/databases/default-database-typeorm-connection-options';

@Module({
  imports: [
    LoggingModule.forRoot(LoggingServiceSingleton.getInstance()),
    TypeOrmModule.forRoot({
      ...DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
      autoLoadEntities: true,
    }),
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule {}
