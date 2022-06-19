import { object } from 'not-me/lib/schemas/object/object-schema';
import { Schema } from 'not-me/lib/schemas/schema';
import { string } from 'not-me/lib/schemas/string/string-schema';
import { LoginRequestDTO } from './auth.dto';

export const loginRequestSchema: Schema<LoginRequestDTO> = object({
  email: string()
    .required()
    .transform((s) => s.trim())
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
  password: string()
    .required()
    .test((s) => (s.length > 0 ? null : 'Must be filled')),
}).required();
