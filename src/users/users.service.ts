import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { Connection, EntityManager } from 'typeorm';
import { SignupVerificationToken } from './signup-verification-tokens/typeorm/signup-verification-token.entity';
import { User } from './typeorm/user.entity';
import { UsersRepository } from './users.repository';
import bcrypt from 'bcrypt';
import { PartialFields } from '@app/shared/internals/utils/types/partial-types';
import { Role } from 'src/auth/roles/roles';
import { SignupVerificationTokensRepository } from './signup-verification-tokens/signup-verifications-token.repository';
import { USERS_SIGNUP_VERIFICATION_TTL } from './users.constants';
import { EmailService } from 'src/internals/email/email.service';
import { SignupResult, UserSignupRequestDTO } from './users.dto';
import { LoggingService } from 'src/internals/logging/logging.service';
import { JobsConfigService } from 'src/internals/jobs/config/jobs-config.service';
import { hashPassword } from './hash-password';

@Injectable()
export class UsersService
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private tokenCleanupInterval?: NodeJS.Timeout;
  private tokensRepository: SignupVerificationTokensRepository;

  constructor(
    @InjectConnection() private connection: Connection,
    private emailService: EmailService,
    private loggingService: LoggingService,
    private jobsConfigService: JobsConfigService,
  ) {
    this.tokensRepository = connection.getCustomRepository(
      SignupVerificationTokensRepository,
    );
  }

  onApplicationBootstrap() {
    if (this.jobsConfigService.shouldCallScheduledJobs) {
      this.tokenCleanupInterval = setInterval(() => {
        this.cleanupExpiredAuthTokens().catch((error) => {
          this.loggingService.logError(
            'token-service:token-cleanup-interval',
            error,
          );
        });
      }, 1000 * 60 * 60);
    }
  }

  onApplicationShutdown() {
    if (this.tokenCleanupInterval) {
      clearInterval(this.tokenCleanupInterval);
    }
  }

  private cleanupExpiredAuthTokens() {
    return this.tokensRepository.deleteExpired();
  }

  /*
  -----------
  -----------
  
  LOGIN

  -----------
  -----------
  */
  async doCredentialsMatch(
    manager: EntityManager,
    email: string,
    password: string,
  ): Promise<{ result: 'match'; user: User } | { result: 'dont-match' }> {
    const usersRepository = manager.getCustomRepository(UsersRepository);

    const user = await usersRepository.findOne({
      where: { email, isVerified: true },
    });

    if (!user) {
      return { result: 'dont-match' };
    }

    const incomingPasswordHash = await bcrypt.hash(password, user.passwordSalt);

    return incomingPasswordHash === user.passwordHash
      ? { result: 'match', user }
      : { result: 'dont-match' };
  }

  /*
  -----------
  -----------
  
  SIGNUP

  -----------
  -----------
  */

  async verifySignupToken(
    auditContext: AuditContext,
    tokenId: SignupVerificationToken['id'],
  ): Promise<'ok' | 'not-found'> {
    return this.connection.transaction(async (manager) => {
      const usersRepository = manager.getCustomRepository(UsersRepository);
      const signupVerificationTokensRepository = manager.getCustomRepository(
        SignupVerificationTokensRepository,
      );

      const token = await signupVerificationTokensRepository.findTokenById(
        tokenId,
      );

      if (!token) {
        return 'not-found';
      } else {
        const user = token.user;

        user.isVerified = true;

        await usersRepository.save(user, auditContext);
        await signupVerificationTokensRepository.deleteFromUser(user);

        return 'ok';
      }
    });
  }

  async sendVerificationLinkEmail(to: string, verificationLink: string) {
    await this.emailService.sendEmail({
      to,
      subject: 'Verify your account',
      body: `
<p>Click or copy this link to verify your newly created account: <a href="${verificationLink}" target="_blank">${verificationLink}</a></p>
`,
    });
  }

  async resendSignupVerificationToken(
    email: User['email'],
    hostname: string,
  ): Promise<'ok' | 'not-found'> {
    return this.connection.transaction(async (manager) => {
      const usersRepository = manager.getCustomRepository(UsersRepository);
      const signupVerificationTokensRepository = manager.getCustomRepository(
        SignupVerificationTokensRepository,
      );

      const user = await usersRepository.findOne({ where: { email } });

      if (!user) {
        return 'not-found';
      }

      const token = await signupVerificationTokensRepository.findTokenByUser(
        user,
      );

      let verificationLink: string;

      if (!token) {
        await signupVerificationTokensRepository.deleteFromUser(user);

        const newToken = await signupVerificationTokensRepository.createToken(
          user,
          USERS_SIGNUP_VERIFICATION_TTL,
        );

        verificationLink = `${hostname}/verify/${newToken.id}`;
      } else {
        verificationLink = `${hostname}/verify/${token.id}`;
      }

      await this.sendVerificationLinkEmail(user.email, verificationLink);

      return 'ok';
    });
  }

  async signup(
    auditContext: AuditContext,
    data: UserSignupRequestDTO,
    hostname: string,
  ): Promise<SignupResult> {
    return this.connection.transaction(async (manager) => {
      const usersRepository = manager.getCustomRepository(UsersRepository);
      const signupVerificationTokensRepository = manager.getCustomRepository(
        SignupVerificationTokensRepository,
      );

      const doesExist = await usersRepository.findOne({
        where: { email: data.email },
      });

      if (doesExist) {
        if (doesExist.isVerified) {
          return SignupResult.AlreadyCreated;
        } else {
          return SignupResult.AwaitingVerification;
        }
      }

      const { passwordSalt, passwordHash } = await hashPassword(data.password);

      const dataWithoutPassword: PartialFields<
        UserSignupRequestDTO,
        'password'
      > = {
        ...data,
      };
      delete dataWithoutPassword.password;

      const user = await usersRepository.create(
        {
          ...dataWithoutPassword,
          passwordHash,
          passwordSalt,
          role: Role.EndUser,
        },
        auditContext,
      );

      const newToken = await signupVerificationTokensRepository.createToken(
        user,
        USERS_SIGNUP_VERIFICATION_TTL,
      );

      await this.sendVerificationLinkEmail(
        user.email,
        `${hostname}/verify/${newToken.id}`,
      );

      return SignupResult.Created;
    });
  }
}
