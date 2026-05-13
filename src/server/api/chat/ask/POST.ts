// User: ask a question against the global knowledge base
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { db } from '../../../db/memory.js';
import { answerQuestion } from '../../../services/rag/pipeline.js';
import { authMiddleware, type AuthRequest } from '../../middleware/auth.js';

export const middleware = [authMiddleware];

export default async function handler(req: AuthRequest, res: Response) {
  try {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      res.status(400).json({ error: 'Question is required' });
      return;
    }

    // Check that the knowledge base has documents
    const docs = db.getAllDocuments().filter((d) => d.status === 'ready');
    if (docs.length === 0) {
      res.json({
        answer:
          'The knowledge base is currently empty. Please ask your administrator to upload documents.',
        sources: [],
      });
      return;
    }

    const result = await answerQuestion(question.trim());

    // Save to chat history
    const userId = req.userId!;
    const userMsg = { id: randomUUID(), userId, role: 'user' as const, content: question.trim(), timestamp: new Date() };
    const assistantMsg = { id: randomUUID(), userId, role: 'assistant' as const, content: result.answer, sources: result.sources, timestamp: new Date() };
    db.addChatMessage(userId, userMsg);
    db.addChatMessage(userId, assistantMsg);

    res.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('API key not configured')) {
      res.status(503).json({ error: 'AI service not configured. Please contact your administrator.' });
    } else {
      res.status(500).json({ error: 'Failed to answer question', message: msg });
    }
  }
}
