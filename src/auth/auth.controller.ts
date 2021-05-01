import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { AuditContext } from 'src/internals/auditing/audit-context';
import { WithAuditContext } from 'src/internals/auditing/audit.decorator';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { UserLoginRequestDTO, UserSignupRequestDTO } from 'src/users/users.dto';
import { UsersService } from 'src/users/users.service';
import { Connection } from 'typeorm';
import {
  RefreshAccessTokenRequestBodyDTO,
  RefreshAccessTokenDTO,
  AuthSessionDTO,
  SignupDTO,
} from './auth.dto';
import { PublicRoute } from './public-route.decorator';
import { AuthTokensService } from './tokens/auth-tokens.service';

@Controller('auth')
export class AuthController {
  constructor(
    private tokensService: AuthTokensService,
    @InjectConnection() private connection: Connection,
    private usersService: UsersService,
  ) {}

  @Post('/refresh')
  public async refresh(
    @Body() body: RefreshAccessTokenRequestBodyDTO,
    @Request() request: AppServerRequest,
  ): Promise<RefreshAccessTokenDTO> {
    const hostname = request.hostname;

    if (!hostname) {
      throw new BadRequestException('no-hostname');
    }

    const accessToken = await this.tokensService.createAccessTokenFromRefreshToken(
      body.refreshToken,
      hostname,
    );

    return {
      accessToken,
    };
  }

  @PublicRoute()
  @Post('/login')
  public async login(
    @Body() body: UserLoginRequestDTO,
    @Request() request: AppServerRequest,
  ): Promise<AuthSessionDTO> {
    const hostname = request.hostname;

    if (!hostname) {
      throw new BadRequestException('no-hostname');
    }

    return this.connection.transaction(async (manager) => {
      const matchResult = await this.usersService.doCredentialsMatch(
        manager,
        body.email,
        body.password,
      );

      if (matchResult.result === 'dont-match') {
        throw new UnauthorizedException();
      } else {
        return this.tokensService.createSession(
          manager,
          matchResult.user,
          hostname,
        );
      }
    });
  }

  @PublicRoute()
  @Post('/signup')
  @HttpCode(200)
  public async signup(
    @WithAuditContext() auditContext: AuditContext,
    @Body() body: UserSignupRequestDTO,
    @Request() request: AppServerRequest,
  ): Promise<SignupDTO> {
    const hostname = request.hostname;

    if (!hostname) {
      throw new BadRequestException('no-hostname');
    }

    const result = await this.usersService.signup(auditContext, body, hostname);

    return {
      result,
    };
  }
}
