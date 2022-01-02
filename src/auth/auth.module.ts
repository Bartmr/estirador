import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AUTH_MODULE_ENTITIES } from './auth-module-entities';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthTokensService } from './tokens/auth-tokens.service';

@Module({
  imports: [TypeOrmModule.forFeature(AUTH_MODULE_ENTITIES)],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthTokensService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
