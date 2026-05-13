// Embeddings + chat — supports OpenAI and Gemini (Google)
import OpenAI from 'openai';
import { db } from '../../db/memory.js';

const GEMINI_EMBED_MODEL = 'gemini-embedding-001';
const GEMINI_CHAT_MODEL = 'gemini-2.5-flash';

// ── OpenAI client ─────────────────────────────────────────────────────
function getOpenAIClient(): OpenAI {
  const key = db.getAIConfig().openaiKey;
  if (!key) throw new Error('OpenAI API key not configured. Please set it in the Admin panel.');
  return new OpenAI({ apiKey: key });
}

// ── Gemini REST helper ────────────────────────────────────────────────
async function geminiEmbed(text: string): Promise<number[]> {
  const key = db.getAIConfig().geminiKey;
  if (!key) throw new Error('Gemini API key not configured. Please set it in the Admin panel.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_EMBED_MODEL}:embedContent`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBED_MODEL}`,
      content: { parts: [{ text }] },
      taskType: 'RETRIEVAL_DOCUMENT',
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini embed error: ${err}`);
  }
  const data = await res.json();
  return data.embedding.values as number[];
}

async function geminiEmbedBatch(texts: string[]): Promise<number[][]> {
  // Gemini doesn't have a batch embed endpoint — run in parallel (max 5 at a time)
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += 5) {
    const batch = texts.slice(i, i + 5);
    const embeddings = await Promise.all(batch.map(geminiEmbed));
    results.push(...embeddings);
  }
  return results;
}

// ── Public API ────────────────────────────────────────────────────────
export async function embedText(text: string): Promise<number[]> {
  const { provider } = db.getAIConfig();
  if (provider === 'gemini') return geminiEmbed(text);
  const client = getOpenAIClient();
  const res = await client.embeddings.create({ model: 'text-embedding-3-small', input: text });
  return res.data[0].embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { provider } = db.getAIConfig();
  if (provider === 'gemini') return geminiEmbedBatch(texts);
  const client = getOpenAIClient();
  const res = await client.embeddings.create({ model: 'text-embedding-3-small', input: texts });
  return res.data.map((item) => item.embedding);
}

export async function chatComplete(systemPrompt: string, userPrompt: string): Promise<{ text: string; tokens?: number }> {
  const { provider, geminiKey, openaiKey } = db.getAIConfig();

  if (provider === 'gemini') {
    if (!geminiKey) throw new Error('Gemini API key not configured.');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_CHAT_MODEL}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiKey },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.7 },
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini chat error: ${err}`);
    }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No answer generated';
    return { text };
  }

  // OpenAI
  if (!openaiKey) throw new Error('OpenAI API key not configured.');
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });
  return {
    text: completion.choices[0].message.content ?? 'No answer generated',
    tokens: completion.usage?.total_tokens,
  };
}
