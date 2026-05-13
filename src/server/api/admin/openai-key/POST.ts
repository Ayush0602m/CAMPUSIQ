// Admin: set AI provider config (OpenAI or Gemini)
import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const { apiKey, provider } = req.body;

  if (!apiKey || typeof apiKey !== 'string') {
    res.status(400).json({ error: 'API key is required' });
    return;
  }

  if (provider === 'gemini') {
    db.setAIConfig({ geminiKey: apiKey, provider: 'gemini' });
    res.json({ message: 'Gemini API key saved and set as active provider' });
    return;
  }

  // Default: OpenAI
  if (!apiKey.startsWith('sk-')) {
    res.status(400).json({ error: 'Invalid OpenAI API key format (must start with sk-)' });
    return;
  }
  db.setAIConfig({ openaiKey: apiKey, provider: 'openai' });
  res.json({ message: 'OpenAI API key saved and set as active provider' });
}
