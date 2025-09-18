import bcrypt from 'bcrypt';
import jwt, {
  JwtPayload as JWTStandardPayload,
  Secret,
  SignOptions,
} from 'jsonwebtoken';

export interface JwtPayload extends JWTStandardPayload {
  sub?: string;
  role?: string;
  [key: string]: unknown;
}

// Bcrypt helpers
export async function hashPassword(
  plain: string,
  saltRounds = Number(process.env['BCRYPT_SALT_ROUNDS'] ?? 10)
) {
  return bcrypt.hash(plain, saltRounds);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// JWT helpers
export function signAccessToken(payload: JwtPayload) {
  const secret = process.env['ACCESS_TOKEN_SECRET'] as Secret | undefined;
  const ttl = (process.env['ACCESS_TOKEN_EXPIRY'] ?? '15m') as string | number;
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET not set');
  return jwt.sign(payload, secret as Secret, { expiresIn: ttl } as SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  const secret = process.env['ACCESS_TOKEN_SECRET'];
  if (!secret) throw new Error('ACCESS_TOKEN_SECRET not set');
  return jwt.verify(token, secret) as JwtPayload;
}

export function signRefreshToken(payload: JwtPayload) {
  const secret = process.env['REFRESH_TOKEN_SECRET'] as Secret | undefined;
  const ttl = (process.env['REFRESH_TOKEN_EXPIRY'] ?? '7d') as string | number;
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET not set');
  return jwt.sign(payload, secret as Secret, { expiresIn: ttl } as SignOptions);
}

export function verifyRefreshToken(token: string): JwtPayload {
  const secret = process.env['REFRESH_TOKEN_SECRET'];
  if (!secret) throw new Error('REFRESH_TOKEN_SECRET not set');
  return jwt.verify(token, secret) as JwtPayload;
}
