import { ValidationSchema } from '@opplane/not-me/lib/resolvers/nest/validation-schema.decorator';
import { object } from '@opplane/not-me/lib/schemas/object/object-schema';
import { Schema } from '@opplane/not-me/lib/schemas/schema';
import { string } from '@opplane/not-me/lib/schemas/string/string-schema';
import { SignupResult } from 'src/users/users.dto';

const refreshRequestBodySchema: Schema<RefreshAccessTokenRequestBodyDTO> = object(
  {
    refreshToken: string().defined(),
  },
).defined();

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
