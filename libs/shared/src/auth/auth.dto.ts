import { ValidationSchema } from '../internals/validation/validation-schema.decorator';
import { loginRequestSchema } from './auth.schemas';

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
