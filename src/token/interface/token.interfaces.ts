import { Role } from '../../enum/role.enum';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: number;
  role: Role;
}
