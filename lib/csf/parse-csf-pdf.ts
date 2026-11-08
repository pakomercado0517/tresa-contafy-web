import { extractPdfText } from './extract-pdf-text';
import { parseCsfText } from './parse-csf-text';
import { CsfParseError, type ParsedCsfData } from './types';

export const CSF_PDF_MAX_BYTES = 10 * 1024 * 1024;

export function assertValidCsfPdfFile(file: File): void {
  const isPdfMime = file.type === 'application/pdf' || file.type === '';
  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfMime || !isPdfExtension) {
    throw new CsfParseError('Solo se aceptan archivos PDF de la Constancia de Situación Fiscal.');
  }

  if (file.size <= 0) {
    throw new CsfParseError('El archivo está vacío.');
  }

  if (file.size > CSF_PDF_MAX_BYTES) {
    throw new CsfParseError('El PDF supera el tamaño máximo de 10 MB.');
  }
}

/**
 * Lee un PDF de CSF en el cliente y devuelve datos para prellenar el formulario de perfil.
 */
export async function parseCsfPdf(file: File): Promise<ParsedCsfData> {
  assertValidCsfPdfFile(file);
  const text = await extractPdfText(file);
  return parseCsfText(text);
}

export type { ParsedCsfData };
export { CsfParseError };
