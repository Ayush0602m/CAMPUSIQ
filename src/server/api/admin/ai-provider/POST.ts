// Admin: switch the active AI provider without changing keys
import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const { provider } = req.body;

  if (provider !== 'openai' && provider !== 'gemini') {
    res.status(400).json({ error: 'Provider must be "openai" or "gemini"' });
    return;
  }

  const config = db.getAIConfig();

  if (provider === 'openai' && !config.openaiKey) {
    res.status(400).json({ error: 'No OpenAI key configured. Add a key first.' });
    return;
  }
  if (provider === 'gemini' && !config.geminiKey) {
    res.status(400).json({ error: 'No Gemini key configured. Add a key first.' });
    return;
  }

  db.setAIConfig({ provider });
  res.json({ message: `Switched to ${provider}`, provider });
}
