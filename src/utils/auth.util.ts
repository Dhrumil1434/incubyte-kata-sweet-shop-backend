import bcrypt from 'bcrypt';
import jwt, {
  JwtPayload as JWTStandardPayload,
  Secret,
  SignOptions,
} from 'jsonwebtoken';
import type { Response } from 'express';

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

function parseDurationToMs(
  input: string | number | undefined,
  fallbackMs: number
): number {
  if (typeof input === 'number') return input;
  if (!input) return fallbackMs;
  const str = String(input).trim();
  const m = str.match(/^([0-9]+)(ms|s|m|h|d)$/i);
  if (!m) return fallbackMs;
  const num = m[1];
  const unitRaw = m[2];
  if (!num || !unitRaw) return fallbackMs;
  const val = Number(num);
  if (Number.isNaN(val)) return fallbackMs;
  const unit = unitRaw.toLowerCase();
  switch (unit) {
    case 'ms':
      return val;
    case 's':
      return val * 1000;
    case 'm':
      return val * 60 * 1000;
    case 'h':
      return val * 60 * 60 * 1000;
    case 'd':
      return val * 24 * 60 * 60 * 1000;
    default:
      return fallbackMs;
  }
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string
) {
  const isProd = (process.env['NODE_ENV'] || '').toLowerCase() === 'production';
  const accessMs = parseDurationToMs(
    process.env['ACCESS_TOKEN_EXPIRY'] ?? '15m',
    15 * 60 * 1000
  );
  const refreshMs = parseDurationToMs(
    process.env['REFRESH_TOKEN_EXPIRY'] ?? '7d',
    7 * 24 * 60 * 60 * 1000
  );

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: accessMs,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: refreshMs,
  });
}
