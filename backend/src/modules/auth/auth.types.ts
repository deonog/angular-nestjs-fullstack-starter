export interface JwtPayload {
  sub: string;
  email: string;
}

export interface RefreshJwtPayload {
  sub: string;
  jti: string;
}

export interface AuthenticatedUser {
  userId: string;
  email: string;
}
