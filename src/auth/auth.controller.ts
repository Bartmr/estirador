import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from '@app/shared/auth/auth.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { AppServerResponse } from 'src/internals/server/types/app-server-response-types';
import { UsersService } from 'src/users/users.service';
import { Connection } from 'typeorm';
import { AuthContext } from './auth-context';
import {
  WithAuthContext,
  WithOptionalAuthContext,
} from './auth-context.decorator';
import { AUTH_TOKEN_HTTP_ONLY_KEY_COOOKIE } from './auth.constants';
import { PublicRoute } from './public-route.decorator';
import { AuthTokensService } from './tokens/auth-tokens.service';

@Controller('auth')
export class AuthController {
  constructor(
    private tokensService: AuthTokensService,
    @InjectConnection() private connection: Connection,
    private usersService: UsersService,
  ) {}

  @HttpCode(201)
  @PublicRoute()
  @Post()
  public async login(
    @Body() body: LoginRequestDTO,
    @Request() request: AppServerRequest,
    @Response({ passthrough: true }) response: AppServerResponse,
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<LoginResponseDTO> {
    const hostname = request.hostname;

    if (!hostname) {
      throw new BadRequestException();
    }

    if (authContext) {
      throw new BadRequestException();
    }

    const matchResult = await this.usersService.doCredentialsMatch(
      this.connection.manager,
      body.email,
      body.password,
    );

    if (matchResult.result === 'dont-match') {
      throw new NotFoundException();
    } else {
      const token = await this.tokensService.createAuthToken(
        this.connection.manager,
        matchResult.user,
      );

      response.cookie(AUTH_TOKEN_HTTP_ONLY_KEY_COOOKIE, token.httpsOnlyKey, {
        expires: token.expires,
        httpOnly: true,
        secure: NODE_ENV === NodeEnv.Production,
        domain: hostname,
      });

      return {
        authTokenId: token.id,
        session: { userId: matchResult.user.id },
      };
    }
  }

  @Get()
  public async getSession(
    @WithAuthContext() authContext: AuthContext,
  ): Promise<AuthSessionDTO> {
    return {
      userId: authContext.user.id,
    };
  }
}
