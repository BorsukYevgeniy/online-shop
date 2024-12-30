export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  id: number;
  roles: string[];
}
