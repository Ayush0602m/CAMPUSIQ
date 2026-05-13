// PDF text extraction service. Parsing runs in a child process so a heavy PDF
// cannot exhaust the main dev server's heap.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
}

const WORKER_TIMEOUT_MS = 45_000;
const WORKER_MAX_OUTPUT_BYTES = 2_000_000;
const workerPath = fileURLToPath(new URL('./extract-worker.cjs', import.meta.url));

export async function extractText(buffer: Buffer): Promise<PDFExtractionResult> {
  return new Promise<PDFExtractionResult>((resolve, reject) => {
    const child = spawn(process.execPath, ['--max-old-space-size=384', workerPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finish = (error?: Error, result?: PDFExtractionResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (!child.killed) child.kill();
      if (error) reject(error);
      else resolve(result!);
    };

    const timeout = setTimeout(() => {
      finish(new Error('PDF extraction timed out. Try a smaller or simpler PDF.'));
    }, WORKER_TIMEOUT_MS);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');

    child.stdout.on('data', (chunk: string) => {
      stdout += chunk;
      if (Buffer.byteLength(stdout, 'utf8') > WORKER_MAX_OUTPUT_BYTES) {
        finish(new Error('PDF extraction output was too large. Split the PDF into smaller parts.'));
      }
    });

    child.stderr.on('data', (chunk: string) => {
      stderr += chunk;
    });

    child.on('error', (error) => {
      finish(new Error(`Failed to start PDF extractor: ${error.message}`));
    });

    child.on('close', (code) => {
      if (settled) return;
      if (code !== 0) {
        finish(new Error(`PDF extractor failed${stderr ? `: ${stderr.trim()}` : ''}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout) as PDFExtractionResult & { error?: string };
        if (parsed.error) {
          finish(new Error(parsed.error));
          return;
        }
        finish(undefined, {
          text: parsed.text || '',
          pageCount: parsed.pageCount || 0,
        });
      } catch (error) {
        finish(new Error(`Invalid PDF extractor response: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });

    child.stdin.end(buffer);
  }).catch((error) => {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  });
}
