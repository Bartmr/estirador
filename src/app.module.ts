import { Module, OnApplicationShutdown } from '@nestjs/common';
import { CROSS_CUTTING_PROVIDERS } from './cross-cutting-providers';
import { LoggingModule } from './internals/logging/logging.module';
import { LoggingService } from './internals/logging/logging.service';
import { LoggingServiceSingleton } from './internals/logging/logging.service.singleton';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS } from './internals/databases/default-database-typeorm-connection-options';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...DEFAULT_DATABASE_TYPEORM_CONNECTION_OPTIONS,
      autoLoadEntities: true,
    }),
    LoggingModule.forRoot(LoggingServiceSingleton.getInstance()),
    AuthModule,
  ],
  providers: [...CROSS_CUTTING_PROVIDERS],
})
export class AppModule implements OnApplicationShutdown {
  constructor(private loggingService: LoggingService) {}

  onApplicationShutdown() {
    this.loggingService.logInfo(
      'app-is-gracefully-shutting-down',
      `App is gracefully shutting down`,
    );
  }
}
