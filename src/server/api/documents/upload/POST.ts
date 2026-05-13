// Deprecated - use /api/admin/documents/upload instead
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  res.status(403).json({ error: 'Document upload is managed by admin. Use /api/admin/documents/upload.' });
}
