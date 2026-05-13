// Deprecated - use /api/admin/documents/delete instead
import type { Request, Response } from 'express';

export default async function handler(_req: Request, res: Response) {
  res.status(403).json({ error: 'Document deletion is managed by admin.' });
}
