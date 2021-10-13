import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/internals/email/email.module';
import { JobsConfigModule } from 'src/internals/jobs/config/jobs-config.module';
import { SignupVerificationToken } from './signup-verification-tokens/typeorm/signup-verification-token.entity';
import { User } from './typeorm/user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SignupVerificationToken]),
    EmailModule,
    JobsConfigModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
