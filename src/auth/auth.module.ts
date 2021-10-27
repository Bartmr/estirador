import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthTokensService } from './tokens/auth-tokens.service';
import { JobsConfigModule } from 'src/internals/jobs/config/jobs-config.module';
import { AuthToken } from './tokens/typeorm/auth-token.entity';
import { User } from 'src/users/typeorm/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AuthToken, User]), JobsConfigModule],
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
