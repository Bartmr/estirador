import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtVerifyOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Algorithm, JsonWebTokenError, SignOptions } from 'jsonwebtoken';
import { EnvironmentVariablesService } from 'src/internals/environment/environment-variables.service';
import { NODE_ENV } from 'src/internals/environment/node-env.constants';
import { NodeEnv } from 'src/internals/environment/node-env.types';
import { LoggingService } from 'src/internals/logging/logging.service';
import { throwError } from 'src/internals/utils/throw-error';
import { User } from 'src/users/typeorm/user.entity';
import { RefreshTokensRepository } from './refresh-token.repository';
import { accessTokenPayloadSchema } from './auth-tokens.types';
import { RefreshToken } from './typeorm/refresh-token.entity';
import { TokensService } from 'src/internals/tokens/tokens.service';
import { EntityManager } from 'typeorm';
import { AuthSessionDTO } from '../auth.dto';
import { HttpAdapterHost } from '@nestjs/core';
import { AppServerHttpAdapter } from 'src/internals/server/types/app-server-http-adapter-types';
import { JobsConfigService } from 'src/internals/jobs/config/jobs-config.service';

const JWT_ALGORITHM: Algorithm = 'HS256';

@Injectable()
export class AuthTokensService extends TokensService<RefreshTokensRepository> {
  constructor(
    @InjectRepository(RefreshTokensRepository)
    tokensRepository: RefreshTokensRepository,
    loggingService: LoggingService,
    private jwtService: JwtService,
    private httpAdapterHost: HttpAdapterHost<AppServerHttpAdapter>,
    jobsConfigService: JobsConfigService,
  ) {
    super(tokensRepository, loggingService, jobsConfigService);
  }

  async createSession(
    manager: EntityManager,
    user: User,
    hostname: string,
  ): Promise<AuthSessionDTO> {
    const refreshTokenRes = await this.generateRefreshToken(
      manager,
      user,
      hostname,
    );
    const accessToken = await this.generateAccessToken(
      refreshTokenRes.entity,
      hostname,
    );

    return {
      accessToken,
      refreshToken: refreshTokenRes.token,
    };
  }

  public async validateAccessToken(
    accessToken: string,
    hostname: string,
  ): Promise<User> {
    const verifyOpts: JwtVerifyOptions = {
      algorithms: [JWT_ALGORITHM],
    };

    if (NODE_ENV === NodeEnv.Test) {
      const address = this.httpAdapterHost.httpAdapter
        .getHttpServer()
        .address();

      verifyOpts.issuer =
        address === null || typeof address === 'string'
          ? throwError()
          : `http://localhost:${address.port}`;
    } else {
      verifyOpts.issuer =
        EnvironmentVariablesService.variables.JWT_ISSUER || throwError();
    }

    verifyOpts.audience = hostname;

    let unparsedPayload: object;

    try {
      unparsedPayload = await this.jwtService.verifyAsync<object>(
        accessToken,
        verifyOpts,
      );
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException();
      } else {
        throw err;
      }
    }

    const payloadValidationResult = accessTokenPayloadSchema.validate(
      unparsedPayload,
    );

    if (payloadValidationResult.errors) {
      throw new UnauthorizedException();
    }

    const refreshToken = await this.tokensRepository.findTokenById(
      payloadValidationResult.value.sub,
    );

    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const user = refreshToken.user;

    if (user.archivedAt) {
      throw new UnauthorizedException();
    }

    return user;
  }

  public async createAccessTokenFromRefreshToken(
    refreshToken: string,
    hostname: string,
  ): Promise<string> {
    let unparsedPayload: object;

    try {
      unparsedPayload = await this.jwtService.verifyAsync<object>(refreshToken);
    } catch (err: unknown) {
      if (err instanceof JsonWebTokenError) {
        throw new UnauthorizedException();
      } else {
        throw err;
      }
    }

    const payloadValidationResult = accessTokenPayloadSchema.validate(
      unparsedPayload,
    );

    if (payloadValidationResult.errors) {
      throw new UnauthorizedException();
    }

    const payload = payloadValidationResult.value;

    const refreshTokenInDB = await this.tokensRepository.findTokenById(
      payload.jti,
    );

    if (!refreshTokenInDB) {
      throw new UnauthorizedException();
    }

    if (refreshTokenInDB.expires.getTime() < Date.now()) {
      throw new UnauthorizedException();
    }

    const accessToken = await this.generateAccessToken(
      refreshTokenInDB,
      hostname,
    );

    return accessToken;
  }

  private async generateAccessToken(
    refreshToken: RefreshToken,
    hostname: string,
  ): Promise<string> {
    const opts: SignOptions = {
      algorithm: JWT_ALGORITHM,
      subject: refreshToken.id,
    };

    if (NODE_ENV === NodeEnv.Test) {
      const address = this.httpAdapterHost.httpAdapter
        .getHttpServer()
        .address();

      opts.issuer =
        address === null || typeof address === 'string'
          ? throwError()
          : `http://localhost:${address.port}`;
    } else {
      opts.issuer =
        EnvironmentVariablesService.variables.JWT_ISSUER || throwError();
    }

    opts.audience = hostname;

    return this.jwtService.signAsync({}, opts);
  }

  private async generateRefreshToken(
    manager: EntityManager,
    user: User,
    hostname: string,
  ) {
    const tokensRepository = manager.getCustomRepository(
      RefreshTokensRepository,
    );

    const ttl = EnvironmentVariablesService.variables.JWT_REFRESH_TOKEN_TTL;

    const token = await tokensRepository.createToken(user, ttl);

    const opts: SignOptions = {
      algorithm: JWT_ALGORITHM,
      expiresIn: ttl,
      subject: token.id,
      jwtid: token.id,
    };

    if (NODE_ENV === NodeEnv.Test) {
      const address = this.httpAdapterHost.httpAdapter
        .getHttpServer()
        .address();

      opts.issuer =
        address === null || typeof address === 'string'
          ? throwError()
          : `http://localhost:${address.port}`;
    } else {
      opts.issuer =
        EnvironmentVariablesService.variables.JWT_ISSUER || throwError();
    }

    opts.audience = hostname;

    const signedToken = await this.jwtService.signAsync({}, opts);

    return {
      entity: token,
      token: signedToken,
    };
  }
}
