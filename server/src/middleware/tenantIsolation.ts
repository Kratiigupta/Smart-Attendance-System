import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';

/**
 * Tenant isolation middleware.
 * For non-super_admin users, ensures that `req.collegeId` is always set
 * from the JWT payload, preventing cross-tenant data access.
 * Super admins can optionally specify a collegeId via query param.
 */
export function tenantIsolation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required.',
    });
    return;
  }

  if (req.user.role === 'super_admin') {
    // Super admins can operate across colleges via query param
    const queryCollegeId = req.query.collegeId as string | undefined;
    if (queryCollegeId) {
      (req as any).collegeId = queryCollegeId;
    }
  } else {
    // All other users are locked to their own college
    (req as any).collegeId = req.user.collegeId;
  }

  next();
}
