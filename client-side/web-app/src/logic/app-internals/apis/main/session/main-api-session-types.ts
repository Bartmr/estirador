import { AuthSessionDTO, LoginResponseDTO } from '@app/shared/auth/auth.dto';
import { ToIndexedType } from '@app/shared/internals/transports/dto-types';

export type MainApiSessionData = ToIndexedType<AuthSessionDTO>;
export type LoginResponse = ToIndexedType<LoginResponseDTO>;
