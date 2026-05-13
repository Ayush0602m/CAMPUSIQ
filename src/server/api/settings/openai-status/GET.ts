// Deprecated - OpenAI key is now admin-managed globally
import type { Request, Response } from 'express';
import { db } from '../../../db/memory.js';

export default async function handler(_req: Request, res: Response) {
  res.json({ configured: !!db.getAIConfig().openaiKey });
}
