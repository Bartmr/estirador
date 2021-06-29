import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { ValidationSchema } from '../internals/validation/validation-schema.decorator';

const loginRequestSchema: Schema<LoginRequestDTO> = object({
  email: string().filled().required(),
  password: string().filled().required(),
}).required();

@ValidationSchema(loginRequestSchema)
export class LoginRequestDTO {
  email!: string;
  password!: string;
}

export class AuthSessionDTO {
  userId!: string;
}

export class LoginResponseDTO {
  authTokenId!: string;
  session!: AuthSessionDTO;
}
