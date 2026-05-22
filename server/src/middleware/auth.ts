import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    collegeId: string;
    role: 'super_admin' | 'college_admin' | 'hod' | 'faculty' | 'student';
    email: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Token missing.'
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded as AuthRequest['user'];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.'
    });
  }
};
