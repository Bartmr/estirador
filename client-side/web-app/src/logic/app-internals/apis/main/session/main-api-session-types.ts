import { AuthSessionDTO, LoginResponseDTO } from '@app/shared/auth/auth.dto';
import { ToJSON } from '@app/shared/internals/transports/json-type-converters';

export type MainApiSessionData = ToJSON<AuthSessionDTO>;
export type LoginResponse = ToJSON<LoginResponseDTO>;
