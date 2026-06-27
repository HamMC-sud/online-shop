import { UserRole } from '../../modules/users/enums/user-role.enum';
import { UserStatus } from '../../modules/users/enums/user-status.enum';

export interface JwtPayloadInterface {
  sub: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  sessionId?: string;
  type: 'access' | 'refresh';
}
