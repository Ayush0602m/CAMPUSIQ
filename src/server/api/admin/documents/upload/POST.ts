// Admin: upload a PDF to the global knowledge base
import type { Response } from 'express';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { db, type DocCategory } from '../../../../db/memory.js';
import { extractText } from '../../../../services/pdf/processor.js';
import { processDocument } from '../../../../services/rag/pipeline.js';
import { adminMiddleware, type AuthRequest } from '../../../middleware/adminAuth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB hard cap to avoid Node heap crashes in dev
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  },
});

export const middleware = [adminMiddleware, upload.single('file')];

export default async function handler(req: AuthRequest, res: Response) {
  try {
    // Fallback: in some dev runtimes, exported middleware may not always attach multipart files.
    // If file is missing but request is multipart, parse it here explicitly.
    if (!(req as any).file && (req.headers['content-type'] || '').includes('multipart/form-data')) {
      await new Promise<void>((resolve, reject) => {
        upload.single('file')(req as any, res as any, (err: unknown) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    const file = (req as any).file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      res.status(413).json({ error: 'PDF too large. Please upload a file under 5MB.' });
      return;
    }

    const category = ((req.body?.category as string) || 'General') as DocCategory;
    const docId = randomUUID();
    const title = file.originalname.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

    // Create document record immediately
    db.createDocument({
      id: docId,
      title,
      filename: file.originalname,
      pageCount: 0,
      uploadedAt: new Date(),
      status: 'processing',
      category,
    });

    res.status(202).json({ id: docId, title, status: 'processing' });

    // Process asynchronously
    try {
      const { text, pageCount } = await extractText(file.buffer);
      db.updateDocument(docId, { pageCount });
      await processDocument(docId, text);
    } catch (err) {
      console.error('Document processing error:', err);
      db.updateDocument(docId, {
        status: 'error',
        errorMessage: err instanceof Error ? err.message : 'Document processing failed',
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Upload failed', message: String(error) });
  }
}
