import { db } from '../../db/memory.js';
import { chunkText } from './chunker.js';
import { embedBatch, embedText, chatComplete } from '../embeddings/openai.js';
import { addVectors, search } from '../vectorstore/memory.js';
import { randomUUID } from 'crypto';

export interface Answer {
  answer: string;
  sources: Array<{ documentId: string; title: string; chunkIndex: number; text: string }>;
  tokensUsed?: number;
}

export async function processDocument(documentId: string, text: string): Promise<void> {
  try {
    db.updateDocument(documentId, { status: 'processing' });
    const chunks = chunkText(text, 1000, 200);
    if (chunks.length === 0) throw new Error('No text content found in document');

    const embeddings = await embedBatch(chunks.map((c) => c.text));
    const vectors = chunks.map((chunk, index) => ({
      id: randomUUID(),
      documentId,
      userId: 'admin',
      embedding: embeddings[index],
      text: chunk.text,
      chunkIndex: chunk.index,
    }));

    await addVectors(vectors);
    db.updateDocument(documentId, { status: 'ready' });
  } catch (error) {
    db.updateDocument(documentId, {
      status: 'error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

export async function answerQuestion(question: string): Promise<Answer> {
  const questionEmbedding = await embedText(question);
  const relevantVectors = await search(questionEmbedding, 5);

  if (relevantVectors.length === 0) {
    return {
      answer:
        "I couldn't find relevant information in the knowledge base. Please try rephrasing your question or ask your program coordinator directly.",
      sources: [],
    };
  }

  const context = relevantVectors
    .map((v, idx) => {
      const doc = db.getDocument(v.documentId);
      return `[Source ${idx + 1} — ${doc?.title ?? 'Document'} (${doc?.category ?? 'General'})]\n${v.text}`;
    })
    .join('\n\n');

  const systemPrompt = `You are CampusIQ, an AI assistant for college students. You answer questions about college policies, schedules, faculty, placements, and study material based on the provided knowledge base.

Guidelines:
- Answer based only on the provided context
- If the context doesn't have enough info, say so clearly and suggest contacting the program coordinator
- Cite sources by referring to [Source N] when relevant
- Be concise, clear, and student-friendly
- For policy questions, be precise about rules and deadlines`;

  const userPrompt = `Context:\n\n${context}\n\nStudent Question: ${question}`;

  const { text, tokens } = await chatComplete(systemPrompt, userPrompt);

  const sources = relevantVectors.map((v) => {
    const doc = db.getDocument(v.documentId);
    return {
      documentId: v.documentId,
      title: doc?.title ?? 'Unknown Document',
      chunkIndex: v.chunkIndex,
      text: v.text.slice(0, 200) + (v.text.length > 200 ? '...' : ''),
    };
  });

  return { answer: text, sources, tokensUsed: tokens };
}
