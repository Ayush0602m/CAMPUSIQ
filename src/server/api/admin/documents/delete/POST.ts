// Admin: delete a document from the knowledge base
import type { Response } from 'express';
import { db } from '../../../../db/memory.js';
import { adminMiddleware, type AuthRequest } from '../../../middleware/adminAuth.js';

export const middleware = [adminMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  const { id } = req.body;
  if (!id) {
    res.status(400).json({ error: 'Document ID required' });
    return;
  }

  const doc = db.getDocument(id);
  if (!doc) {
    res.status(404).json({ error: 'Document not found' });
    return;
  }

  db.deleteDocument(id);
  res.json({ message: 'Document deleted successfully' });
}
