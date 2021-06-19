import { ValidationSchema } from 'not-me-resolver-nestjs';
import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';

const loginRequestSchema: Schema<LoginRequestDTO> = object({
  email: string().filled(),
  password: string().filled(),
}).defined();

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
