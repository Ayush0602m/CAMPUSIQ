const MAX_PARSE_PAGES = 12;
const MAX_EXTRACTED_CHARS = 1_200_000;
const MAX_INPUT_BYTES = 5 * 1024 * 1024;

function getParserModule() {
  return require('pdf-parse');
}

function resolveLegacyParser(pdfParseModule) {
  if (typeof pdfParseModule === 'function') return pdfParseModule;
  if (typeof pdfParseModule?.default === 'function') return pdfParseModule.default;
  if (typeof pdfParseModule?.pdfParse === 'function') return pdfParseModule.pdfParse;
  return null;
}

async function parsePdf(buffer) {
  const pdfParseModule = getParserModule();
  const legacyParser = resolveLegacyParser(pdfParseModule);

  if (legacyParser) {
    const data = await legacyParser(buffer);
    return {
      text: data.text || '',
      pageCount: data.numpages || 0,
    };
  }

  if (typeof pdfParseModule?.PDFParse === 'function') {
    const parser = new pdfParseModule.PDFParse({ data: buffer });
    try {
      const data = await parser.getText({ first: MAX_PARSE_PAGES });
      return {
        text: data?.text || '',
        pageCount: data?.total || data?.pages?.length || 0,
      };
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }

  const keys =
    pdfParseModule && typeof pdfParseModule === 'object'
      ? Object.keys(pdfParseModule).join(', ')
      : typeof pdfParseModule;
  throw new Error(`Unsupported pdf-parse module shape (exports: ${keys})`);
}

const chunks = [];
let totalBytes = 0;

process.stdin.on('data', (chunk) => {
  totalBytes += chunk.length;
  if (totalBytes > MAX_INPUT_BYTES) {
    process.stdout.write(JSON.stringify({ error: 'PDF too large. Please upload a file under 5MB.' }));
    process.exit(0);
  }
  chunks.push(chunk);
});

process.stdin.on('end', async () => {
  try {
    const buffer = Buffer.concat(chunks);
    const result = await parsePdf(buffer);
    if (!result.text.trim()) {
      throw new Error('No selectable text found. Scanned/image-only PDFs are not supported yet.');
    }
    if (result.text.length > MAX_EXTRACTED_CHARS) {
      throw new Error(`Extracted text too large (${result.text.length} chars). Split the PDF into smaller parts.`);
    }
    process.stdout.write(JSON.stringify(result));
  } catch (error) {
    process.stdout.write(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      })
    );
  }
});
