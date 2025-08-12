import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import bcrypt from 'bcryptjs';
import { config } from '../config/environment';

const JWT_SECRET: string = config.jwt.secret;
const JWT_EXPIRES_IN: string = config.jwt.expiresIn;

export interface JWTPayload {
  userId: number;
  username: string;
  role: string;
  hygienistId?: number;
}

/**
 * JWTトークンを生成する
 */
export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as StringValue,
  };
  return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * JWTトークンを検証する
 */
export const verifyToken = (token: string): JWTPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

/**
 * パスワードをハッシュ化する
 */
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * パスワードを検証する
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Authorizationヘッダーからトークンを抽出する
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};