// Deprecated - use /api/admin/openai-key instead
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  res.status(403).json({ error: 'OpenAI key is managed by admin. Use /api/admin/openai-key.' });
}
