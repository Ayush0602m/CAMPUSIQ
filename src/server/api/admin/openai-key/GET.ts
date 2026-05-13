import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(_req: AuthRequest, res: Response) {
  const config = db.getAIConfig();
  res.json({
    provider: config.provider,
    openai: {
      configured: !!config.openaiKey,
      masked: config.openaiKey ? `sk-...${config.openaiKey.slice(-4)}` : null,
    },
    gemini: {
      configured: !!config.geminiKey,
      masked: config.geminiKey ? `...${config.geminiKey.slice(-4)}` : null,
    },
  });
}
