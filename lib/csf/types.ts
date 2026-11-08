export interface ParsedCsfData {
  rfc: string;
  nombre: string;
  tipoPersona: 'FISICA' | 'MORAL';
  regimenesFiscales: string[];
  /** Descripciones de la CSF que no se mapearon a una clave del catálogo. */
  regimenesSinMatch: string[];
}

export class CsfParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CsfParseError';
  }
}
