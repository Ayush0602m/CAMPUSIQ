// Deprecated - documents are now global, use /api/knowledge instead
import type { Response } from 'express';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

export const middleware = [authMiddleware];

export default async function handler(_req: AuthRequest, res: Response) {
  res.json({ documents: [] });
}
