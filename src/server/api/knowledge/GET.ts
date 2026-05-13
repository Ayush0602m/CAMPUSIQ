// Public (authenticated): get knowledge base stats visible to users
import type { Response } from 'express';
import { db } from '../../db/memory.js';
import { authMiddleware, type AuthRequest } from '../middleware/auth.js';

export const middleware = [authMiddleware];

export default async function handler(_req: AuthRequest, res: Response) {
  const docs = db.getAllDocuments();
  const ready = docs.filter((d) => d.status === 'ready');

  res.json({
    totalDocuments: ready.length,
    categories: [...new Set(ready.map((d) => d.category ?? 'General'))],
    documents: ready.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category ?? 'General',
      pageCount: d.pageCount,
    })),
  });
}
