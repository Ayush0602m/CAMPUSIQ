// Text chunking service for RAG
export interface Chunk {
  text: string;
  index: number;
}

/**
 * Chunks text into overlapping segments for better context retrieval
 * @param text - The text to chunk
 * @param chunkSize - Target size of each chunk in characters (default: 1000)
 * @param overlap - Number of characters to overlap between chunks (default: 200)
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200
): Chunk[] {
  // Clean and normalize text
  const cleanText = text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .trim();

  if (cleanText.length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    // Calculate end index for this chunk
    let endIndex = startIndex + chunkSize;

    // If this is not the last chunk, try to break at a sentence or word boundary
    if (endIndex < cleanText.length) {
      // Look for sentence boundary (. ! ?)
      const sentenceEnd = cleanText.lastIndexOf('.', endIndex);
      const exclamationEnd = cleanText.lastIndexOf('!', endIndex);
      const questionEnd = cleanText.lastIndexOf('?', endIndex);
      
      const sentenceBoundary = Math.max(sentenceEnd, exclamationEnd, questionEnd);
      
      if (sentenceBoundary > startIndex) {
        endIndex = sentenceBoundary + 1;
      } else {
        // No sentence boundary found, try word boundary
        const lastSpace = cleanText.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex) {
          endIndex = lastSpace;
        }
      }
    } else {
      // Last chunk, take everything remaining
      endIndex = cleanText.length;
    }

    // Extract chunk text
    const chunkText = cleanText.slice(startIndex, endIndex).trim();
    
    if (chunkText.length > 0) {
      chunks.push({
        text: chunkText,
        index: chunkIndex,
      });
      chunkIndex++;
    }

    // Move start index forward, accounting for overlap
    startIndex = endIndex - overlap;
    
    // Ensure we make progress even with small chunks
    if (startIndex <= chunks[chunks.length - 1]?.text.length) {
      startIndex = endIndex;
    }
  }

  return chunks;
}
