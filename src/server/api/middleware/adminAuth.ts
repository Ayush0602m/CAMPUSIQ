// Middleware that requires the user to be an admin
import type { Response, NextFunction } from 'express';
import { db } from '../../db/memory.js';
import { authMiddleware, type AuthRequest } from './auth.js';

export { type AuthRequest };

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  // First run normal auth
  authMiddleware(req, res, () => {
    const user = db.getUserById(req.userId!);
    if (!user?.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }
    next();
  });
}
