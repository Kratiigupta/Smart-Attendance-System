import { Response, NextFunction } from 'express';
import { registerSchema, loginSchema, forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from '../validators/auth.validator.js';
import {
  registerUser,
  loginUser,
  rotateRefreshToken,
  logoutUser,
  getCurrentUser,
  requestPasswordReset,
  verifyOTPCode,
  resetPassword as resetUserPassword
} from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = registerSchema.parse(req.body);
    const result = await registerUser(body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);
    const result = await loginUser(body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      data: {
        accessToken: result.accessToken,
        user: result.user
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      throw { status: 401, message: 'Refresh token missing.' };
    }

    const result = await rotateRefreshToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    await logoutUser(token);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      throw { status: 401, message: 'Not authenticated.' };
    }

    const profile = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, collegeCode } = forgotPasswordSchema.parse(req.body);
    const result = await requestPasswordReset(email, collegeCode);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, otp } = verifyOtpSchema.parse(req.body);
    await verifyOTPCode(email, otp);
    return res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, otp, password } = resetPasswordSchema.parse(req.body);
    const result = await resetUserPassword(email, otp, password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

