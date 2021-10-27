import {
  AuthSessionDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from 'libs/shared/src/auth/auth.dto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Request,
  Response,
} from '@nestjs/common';
import { AppServerRequest } from 'src/internals/server/types/app-server-request-types';
import { AppServerResponse } from 'src/internals/server/types/app-server-response-types';
import { AuthContext } from './auth-context';
import { WithOptionalAuthContext } from './auth-context.decorator';
import { PublicRoute } from './public-route.decorator';

@Controller('auth')
export class AuthController {
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

    // TODO: implement
    throw new InternalServerErrorException();

    // const token = await this.tokensService.createAuthToken(
    //   this.connection.manager,
    //   matchResult.user,
    // );
    //
    // response.cookie(AUTH_TOKEN_HTTP_ONLY_KEY_COOKIE, token.httpsOnlyKey, {
    //   expires: token.expires,
    //   httpOnly: true,
    //   secure: NODE_ENV === NodeEnv.Production,
    //   domain: hostname,
    // });
    //
    // return {
    //   authTokenId: token.id,
    //   session: { userId: matchResult.user.id },
    // };
  }

  @Get()
  @PublicRoute()
  public async getSession(
    @WithOptionalAuthContext() authContext?: AuthContext,
  ): Promise<AuthSessionDTO> {
    if (authContext) {
      return {
        userId: authContext.user.id,
      };
    } else {
      throw new NotFoundException();
    }
  }
}
