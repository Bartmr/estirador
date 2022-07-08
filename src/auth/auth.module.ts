import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeormFeatureModule } from 'src/internals/databases/typeorm.module';
import { AUTH_MODULE_ENTITIES } from './auth-module-entities';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthTokensService } from './tokens/auth-tokens.service';

@Module({
  imports: [
    TypeormFeatureModule.forFeature({
      entities: AUTH_MODULE_ENTITIES,
    }),
  ],
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
