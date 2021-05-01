import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from 'src/internals/email/email.module';
import { SignupVerificationTokensRepository } from './signup-verification-tokens/signup-verifications-token.repository';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersRepository,
      SignupVerificationTokensRepository,
    ]),
    EmailModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
