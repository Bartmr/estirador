import { AuthToken } from './tokens/typeorm/auth-token.entity';
import { User } from 'src/users/typeorm/user.entity';

export const AUTH_MODULE_ENTITIES = [AuthToken, User];
