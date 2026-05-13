// Admin: list all documents in the knowledge base
import type { Response } from 'express';
import { db } from '../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(_req: AuthRequest, res: Response) {
  const docs = db.getAllDocuments();
  res.json({ documents: docs });
}
