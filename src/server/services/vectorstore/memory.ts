// In-memory vector store with cosine similarity search
import { db } from '../../db/memory.js';

export interface Vector {
  id: string;
  documentId: string;
  userId: string; // kept for compat but unused in global mode
  embedding: number[];
  text: string;
  chunkIndex: number;
}

export interface SearchResult extends Vector {
  score: number;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function addVectors(vectors: Vector[]): Promise<void> {
  for (const v of vectors) db.addVector(v);
}

// Search across ALL documents (global knowledge base)
export async function search(
  queryEmbedding: number[],
  topK = 5,
  documentIds?: string[]
): Promise<SearchResult[]> {
  const allVectors = db.getAllVectors();

  const filtered = documentIds?.length
    ? allVectors.filter((v) => documentIds.includes(v.documentId))
    : allVectors;

  return filtered
    .map((v) => ({ ...v, score: cosineSimilarity(queryEmbedding, v.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
