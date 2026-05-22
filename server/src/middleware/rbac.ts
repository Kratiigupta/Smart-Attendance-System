import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission to access this resource. Requires: [${roles.join(', ')}]`
      });
    }

    next();
  };
};
