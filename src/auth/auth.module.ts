import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { RefreshTokensRepository } from './tokens/refresh-token.repository';
import { AuthTokensService } from './tokens/auth-tokens.service';

@Module({
  imports: [
    JwtModule.register({
      secret: EnvironmentVariablesService.variables.JWT_SECRET,
      signOptions: {
        expiresIn: EnvironmentVariablesService.variables.JWT_ACCESS_TOKEN_TTL,
      },
    }),
    TypeOrmModule.forFeature([RefreshTokensRepository]),
    UsersModule,
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
