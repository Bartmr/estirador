import { ValidationSchema } from 'not-me-resolver-nestjs';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { SignupResult } from 'src/users/users.dto';

const refreshRequestBodySchema: Schema<RefreshAccessTokenRequestBodyDTO> =
  object({
    refreshToken: string().defined(),
  }).defined();

@ValidationSchema(refreshRequestBodySchema)
export class RefreshAccessTokenRequestBodyDTO {
  refreshToken!: string;
}

export class RefreshAccessTokenDTO {
  accessToken!: string;
}

export class AuthSessionDTO {
  accessToken!: string;
  refreshToken!: string;
}

export class SignupDTO {
  result!: SignupResult;
}
