import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { CsfParseError } from './types';

let isWorkerConfigured = false;

function ensurePdfWorker(): void {
  if (isWorkerConfigured || typeof window === 'undefined') {
    return;
  }

  // Servido desde /public (copiar pdf.worker.min.mjs al actualizar pdfjs-dist).
  GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  isWorkerConfigured = true;
}

/**
 * Extrae texto de un PDF en el navegador con pdf.js.
 * Solo para Client Components.
 */
export async function extractPdfText(file: File | ArrayBuffer): Promise<string> {
  if (typeof window === 'undefined') {
    throw new CsfParseError('La lectura del PDF solo está disponible en el navegador.');
  }

  ensurePdfWorker();

  const data =
    file instanceof ArrayBuffer ? new Uint8Array(file) : new Uint8Array(await file.arrayBuffer());

  const loadingTask = getDocument({ data, useSystemFonts: true });

  try {
    const documentProxy = await loadingTask.promise;
    const pageTexts: string[] = [];

    for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber++) {
      const page = await documentProxy.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .filter(Boolean)
        .join(' ');
      pageTexts.push(pageText);
    }

    return pageTexts.join('\n');
  } catch (error) {
    if (error instanceof CsfParseError) {
      throw error;
    }
    throw new CsfParseError(
      'No se pudo abrir el PDF. Asegúrate de subir el archivo digital de la constancia del SAT.'
    );
  } finally {
    await loadingTask.destroy();
  }
}
