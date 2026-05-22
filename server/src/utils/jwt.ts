import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

interface TokenPayload {
  userId: string;
  collegeId: string;
  role: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
};
