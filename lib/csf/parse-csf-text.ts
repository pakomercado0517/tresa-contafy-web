import { matchRegimenDescriptions } from './match-regimen-descriptions';
import { CsfParseError, type ParsedCsfData } from './types';

const RFC_PATTERN_SOURCE = '[A-ZÑ&]{3,4}\\d{6}[A-Z0-9]{3}';

function createRfcGlobalPattern(): RegExp {
  return new RegExp(RFC_PATTERN_SOURCE, 'g');
}

const DATE_TOKEN = '\\d{1,2}[\\/\\-]\\d{1,2}[\\/\\-]\\d{2,4}';

/**
 * Etiquetas típicas de la CSF (orden no importa; se usan para delimitar valores).
 * Más específicas primero dentro de cada familia.
 */
const CSF_FIELD_LABELS: Array<{ key: string; pattern: RegExp }> = [
  { key: 'rfc', pattern: /\bRFC\b\s*:?/i },
  { key: 'curp', pattern: /\bCURP\b\s*:?/i },
  // Requiere "(s)" para no confundir con "Nombre Comercial" / "Nombre Vialidad"
  { key: 'nombre', pattern: /\bNombre\s*\(\s*s\s*\)\s*:?/i },
  { key: 'primerApellido', pattern: /\bPrimer\s+Apellido\s*:?/i },
  { key: 'segundoApellido', pattern: /\bSegundo\s+Apellido\s*:?/i },
  {
    key: 'denominacion',
    pattern: /\bDenominaci[oó]n\s*\/?\s*Raz[oó]n\s+Social\s*:?/i,
  },
  { key: 'nombreComercial', pattern: /\bNombre\s+Comercial\s*:?/i },
  {
    key: 'fechaNacimiento',
    pattern: /\bFecha\s+(?:de\s+)?Nacimiento\s*:?/i,
  },
  {
    key: 'fechaConstitucion',
    pattern: /\bFecha\s+(?:de\s+)?Constituci[oó]n\s*:?/i,
  },
  {
    key: 'fechaInicioOperaciones',
    pattern: /\bFecha\s+(?:de\s+)?Inicio\s+(?:de\s+)?operaciones\s*:?/i,
  },
  {
    key: 'situacionContribuyente',
    pattern: /\bSituaci[oó]n\s+(?:del\s+)?contribuyente\s*:?/i,
  },
  {
    key: 'entidadFederativa',
    pattern: /\bEntidad\s+Federativa\s*:?/i,
  },
  { key: 'municipio', pattern: /\bMunicipio\s*(?:o\s+Demarcaci[oó]n\s+Territorial)?\s*:?/i },
  { key: 'colonia', pattern: /\bColonia\s*:?/i },
  { key: 'tipoVialidad', pattern: /\bTipo\s+(?:de\s+)?Vialidad\s*:?/i },
  { key: 'nombreVialidad', pattern: /\bNombre\s+(?:de\s+)?Vialidad\s*:?/i },
  { key: 'numeroExterior', pattern: /\bN[uú]mero\s+Exterior\s*:?/i },
  { key: 'numeroInterior', pattern: /\bN[uú]mero\s+Interior\s*:?/i },
  { key: 'codigoPostal', pattern: /\bC[oó]digo\s+Postal\s*:?/i },
  { key: 'localidad', pattern: /\bLocalidad\s*:?/i },
  { key: 'entreCalle', pattern: /\bEntre\s+Calle\s*:?/i },
  { key: 'yCalle', pattern: /\bY\s+Calle\s*:?/i },
  { key: 'regimen', pattern: /\bR[eé]gimen(?:es)?(?:\s+Fiscal(?:es)?)?\b\s*:?/i },
  {
    key: 'actividadEconomica',
    pattern: /\bActividades?\s+Econ[oó]micas?\b\s*:?/i,
  },
  { key: 'datosIdentificacion', pattern: /\bDatos\s+(?:de\s+)?Identificaci[oó]n\b/i },
  { key: 'datosDomicilio', pattern: /\bDatos\s+(?:de\s+)?(?:el\s+)?Domicilio\b/i },
];

interface CsfFieldMatch {
  key: string;
  start: number;
  end: number;
}

function normalizeCsfText(raw: string): string {
  return raw
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function inferTipoPersona(rfc: string): 'FISICA' | 'MORAL' {
  return rfc.length === 12 ? 'MORAL' : 'FISICA';
}

function extractRfc(text: string): string | null {
  const upper = text.toUpperCase();
  const labeled = upper.match(/RFC\s*:?\s*([A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3})/);
  if (labeled?.[1]) {
    return labeled[1];
  }

  const matches = upper.match(createRfcGlobalPattern());
  if (!matches || matches.length === 0) {
    return null;
  }

  const preferred = matches.find((m) => m.length === 12 || m.length === 13);
  return preferred ?? matches[0] ?? null;
}

function findFieldMatches(text: string): CsfFieldMatch[] {
  const matches: CsfFieldMatch[] = [];

  for (const field of CSF_FIELD_LABELS) {
    const regex = new RegExp(field.pattern.source, field.pattern.flags.includes('g') ? field.pattern.flags : `${field.pattern.flags}g`);
    for (const match of text.matchAll(regex)) {
      if (match.index === undefined) continue;
      matches.push({
        key: field.key,
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  return matches.sort((a, b) => a.start - b.start || b.end - a.end);
}

function cleanFieldValue(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/^[:\-–|]+/, '')
    .replace(/[:\-–|]+$/, '')
    .trim();
}

function isUsableFieldValue(value: string): boolean {
  const trimmed = cleanFieldValue(value);
  if (trimmed.length < 1 || trimmed.length > 255) return false;
  if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/.test(trimmed)) return false;
  if (/^\d{3}$/.test(trimmed)) return false;
  return /[A-Za-zÁÉÍÓÚÑáéíóúñ0-9]/.test(trimmed);
}

/**
 * Obtiene el valor de un campo etiquetado: texto entre esa etiqueta y la siguiente.
 */
function getLabeledFieldValue(text: string, fieldKey: string): string | null {
  const matches = findFieldMatches(text);
  const fieldIndex = matches.findIndex((m) => m.key === fieldKey);
  if (fieldIndex < 0) return null;

  const field = matches[fieldIndex];
  if (!field) return null;

  const next = matches.slice(fieldIndex + 1).find((m) => m.start >= field.end);
  const rawValue = text.slice(field.end, next?.start ?? text.length);
  const value = cleanFieldValue(rawValue);

  if (!isUsableFieldValue(value)) return null;
  return value;
}

function extractNombreFisica(text: string): string | null {
  const nombre = getLabeledFieldValue(text, 'nombre');
  const primerApellido = getLabeledFieldValue(text, 'primerApellido');
  const segundoApellido = getLabeledFieldValue(text, 'segundoApellido');

  const parts = [nombre, primerApellido, segundoApellido].filter(
    (part): part is string => Boolean(part)
  );

  if (parts.length === 0) return null;
  // Al menos nombre + un apellido, o solo razón de emergencia si solo hay uno usable
  const fullName = parts.join(' ').replace(/\s+/g, ' ').trim();
  return fullName.length >= 2 ? fullName : null;
}

function extractNombreMoral(text: string): string | null {
  const denominacion = getLabeledFieldValue(text, 'denominacion');
  if (denominacion) return denominacion;

  // Fallback opcional si el PDF solo trae nombre comercial
  return getLabeledFieldValue(text, 'nombreComercial');
}

function extractNombre(text: string, tipoPersona: 'FISICA' | 'MORAL'): string | null {
  if (tipoPersona === 'FISICA') {
    return extractNombreFisica(text);
  }
  return extractNombreMoral(text);
}

/**
 * Extrae las descripciones de la tabla "Regímenes:" (columna Régimen).
 * Formato típico CSF: encabezados Régimen | Fecha Inicio | Fecha Fin,
 * luego filas "descripción + fecha inicio [+ fecha fin]".
 */
export function extractRegimenDescriptions(text: string): string[] {
  const sectionMatch = text.match(
    /Reg[ií]menes\s*:?\s*([\s\S]*?)(?=\bObligaciones\b|$)/i
  );
  if (!sectionMatch?.[1]) {
    return [];
  }

  const body = sectionMatch[1]
    .replace(/^\s*R[eé]gimen\s+Fecha\s+Inicio\s+Fecha\s+Fin\s*/i, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!body) {
    return [];
  }

  const descriptions: string[] = [];
  const rowPattern = new RegExp(
    `(.+?)\\s+(${DATE_TOKEN})(?:\\s+(${DATE_TOKEN}))?`,
    'gi'
  );

  for (const match of body.matchAll(rowPattern)) {
    const rawDescription = match[1]?.trim() ?? '';
    const cleaned = rawDescription
      .replace(/^(R[eé]gimen\s+Fecha\s+Inicio\s+Fecha\s+Fin)\s*/i, '')
      .trim();
    if (cleaned.length >= 8) {
      descriptions.push(cleaned);
    }
  }

  return descriptions;
}

function extractRegimenes(text: string): Pick<ParsedCsfData, 'regimenesFiscales' | 'regimenesSinMatch'> {
  const descriptions = extractRegimenDescriptions(text);
  const { claves, sinMatch } = matchRegimenDescriptions(descriptions);
  return {
    regimenesFiscales: claves,
    regimenesSinMatch: sinMatch,
  };
}

/**
 * Interpreta el texto plano de una Constancia de Situación Fiscal del SAT.
 */
export function parseCsfText(rawText: string): ParsedCsfData {
  const text = normalizeCsfText(rawText);

  if (text.length < 20) {
    throw new CsfParseError(
      'El PDF no contiene texto legible. Descarga la constancia digital desde el SAT (no uses foto ni escaneo).'
    );
  }

  const rfc = extractRfc(text);
  if (!rfc) {
    throw new CsfParseError(
      'No se pudo leer el RFC de la constancia. Verifica que sea el PDF digital emitido por el SAT.'
    );
  }

  const tipoPersona = inferTipoPersona(rfc);
  const nombre = extractNombre(text, tipoPersona);
  if (!nombre) {
    throw new CsfParseError(
      tipoPersona === 'FISICA'
        ? 'No se pudieron leer Nombre(s) y apellidos de la constancia. Puedes completarlos manualmente.'
        : 'No se pudo leer la Denominación/Razón Social de la constancia. Puedes completarla manualmente.'
    );
  }

  const regimenes = extractRegimenes(text);

  return {
    rfc,
    nombre,
    tipoPersona,
    regimenesFiscales: regimenes.regimenesFiscales,
    regimenesSinMatch: regimenes.regimenesSinMatch,
  };
}
