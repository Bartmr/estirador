import { object } from '@opplane/not-me/lib/schemas/object/object-schema';
import { Schema } from '@opplane/not-me/lib/schemas/schema';
import { string } from '@opplane/not-me/lib/schemas/string/string-schema';

export const accessTokenPayloadSchema: Schema<AccessTokenPayload> = object({
  sub: string().defined(),
  jti: string().defined(),
}).defined();

export type AccessTokenPayload = {
  sub: string;
  jti: string;
};

export const refreshTokenPayloadSchema: Schema<RefreshTokenPayload> = object({
  sub: string().defined(),
  jti: string().defined(),
}).defined();

export type RefreshTokenPayload = {
  sub: string;
  jti: string;
};
