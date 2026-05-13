import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { authMiddleware, type AuthRequest } from '../../middleware/auth.js';

export const middleware = [authMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const history = db.getChatHistory(req.userId!);
  res.json({ history });
}
