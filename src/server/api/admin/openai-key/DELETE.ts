import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const { provider } = req.body ?? {};
  if (provider === 'gemini') {
    db.setAIConfig({ geminiKey: undefined });
    res.json({ message: 'Gemini API key removed' });
  } else {
    db.setAIConfig({ openaiKey: undefined });
    res.json({ message: 'OpenAI API key removed' });
  }
}
