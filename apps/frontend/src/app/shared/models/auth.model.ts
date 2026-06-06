export interface AuthUser {
  id: string;
  email: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}
