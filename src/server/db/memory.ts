// In-memory database for CampusIQ
import type { Vector } from '../services/vectorstore/memory.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  createdAt: Date;
}

export type DocCategory =
  | 'Placement Policy'
  | 'Class Schedules'
  | 'Faculty Info'
  | 'Placements'
  | 'Study Material'
  | 'College Policies'
  | 'General';

export const DOC_CATEGORIES: DocCategory[] = [
  'Placement Policy',
  'Class Schedules',
  'Faculty Info',
  'Placements',
  'Study Material',
  'College Policies',
  'General',
];

export interface Document {
  id: string;
  title: string;
  filename: string;
  pageCount: number;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  errorMessage?: string;
  category: DocCategory;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ documentId: string; chunkIndex: number; text: string; title?: string }>;
  timestamp: Date;
}

export type AIProvider = 'openai' | 'gemini';

export interface AIConfig {
  provider: AIProvider;
  openaiKey?: string;
  geminiKey?: string;
}

class MemoryDatabase {
  private users: Map<string, User> = new Map();
  private documents: Map<string, Document> = new Map();
  private vectors: Map<string, Vector> = new Map();
  private chatHistory: Map<string, ChatMessage[]> = new Map();
  private aiConfig: AIConfig = { provider: 'openai' };

  // ── Users ─────────────────────────────────────────────────────────────
  createUser(user: User): void { this.users.set(user.id, user); }
  getUserById(id: string): User | undefined { return this.users.get(id); }
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email === email);
  }

  // ── Documents ─────────────────────────────────────────────────────────
  createDocument(doc: Document): void { this.documents.set(doc.id, doc); }
  getDocument(id: string): Document | undefined { return this.documents.get(id); }
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
    );
  }
  getDocumentsByCategory(category: DocCategory): Document[] {
    return this.getAllDocuments().filter((d) => d.category === category && d.status === 'ready');
  }
  updateDocument(id: string, updates: Partial<Document>): void {
    const doc = this.documents.get(id);
    if (doc) this.documents.set(id, { ...doc, ...updates });
  }
  deleteDocument(id: string): void {
    this.documents.delete(id);
    for (const [vid, v] of this.vectors.entries()) {
      if (v.documentId === id) this.vectors.delete(vid);
    }
  }

  // ── Vectors ───────────────────────────────────────────────────────────
  addVector(vector: Vector): void { this.vectors.set(vector.id, vector); }
  getAllVectors(): Vector[] { return Array.from(this.vectors.values()); }
  deleteVectorsByDocumentId(documentId: string): void {
    for (const [vid, v] of this.vectors.entries()) {
      if (v.documentId === documentId) this.vectors.delete(vid);
    }
  }

  // ── Chat history ──────────────────────────────────────────────────────
  addChatMessage(userId: string, message: ChatMessage): void {
    const history = this.chatHistory.get(userId) || [];
    history.push(message);
    this.chatHistory.set(userId, history);
  }
  getChatHistory(userId: string, limit = 50): ChatMessage[] {
    return (this.chatHistory.get(userId) || []).slice(-limit);
  }
  clearChatHistory(userId: string): void { this.chatHistory.delete(userId); }

  // ── AI Config (admin-managed) ─────────────────────────────────────────
  setAIConfig(config: Partial<AIConfig>): void {
    this.aiConfig = { ...this.aiConfig, ...config };
  }
  getAIConfig(): AIConfig { return this.aiConfig; }
}

export const db = new MemoryDatabase();
