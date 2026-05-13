import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { authMiddleware, type AuthRequest } from '../../middleware/auth.js';

export const middleware = [authMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const user = db.getUserById(req.userId!);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
}
