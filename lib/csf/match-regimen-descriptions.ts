import { SAT_REGIMENES } from '@/lib/constants/sat';

/**
 * Normaliza texto de régimen CSF/catálogo para comparar sin acentos,
 * prefijos "Régimen de" ni sufijos entre paréntesis (p. ej. RESICO).
 */
export function normalizeRegimenDescription(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\br[eé]gimen(?:es)?\s+(?:de\s+|fiscal(?:es)?\s+)?/gi, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface RegimenMatchResult {
  claves: string[];
  sinMatch: string[];
}

interface CatalogEntry {
  clave: string;
  descripcion: string;
  normalized: string;
}

function buildCatalogEntries(
  catalog: Record<string, string> = SAT_REGIMENES
): CatalogEntry[] {
  return Object.entries(catalog).map(([clave, descripcion]) => ({
    clave,
    descripcion,
    normalized: normalizeRegimenDescription(descripcion),
  }));
}

function findClaveForDescription(
  description: string,
  entries: CatalogEntry[]
): string | null {
  const normalized = normalizeRegimenDescription(description);
  if (!normalized) return null;

  const exact = entries.find((entry) => entry.normalized === normalized);
  if (exact) return exact.clave;

  const partialMatches = entries
    .filter(
      (entry) =>
        entry.normalized.includes(normalized) || normalized.includes(entry.normalized)
    )
    .sort((a, b) => b.normalized.length - a.normalized.length);

  return partialMatches[0]?.clave ?? null;
}

/**
 * Resuelve descripciones de la columna "Régimen" de la CSF a claves del catálogo SAT.
 * Devuelve claves matcheadas y descripciones sin correspondencia.
 */
export function matchRegimenDescriptions(
  descriptions: string[],
  catalog: Record<string, string> = SAT_REGIMENES
): RegimenMatchResult {
  const entries = buildCatalogEntries(catalog);
  const matched = new Set<string>();
  const sinMatch: string[] = [];

  for (const description of descriptions) {
    const clave = findClaveForDescription(description, entries);
    if (clave) {
      matched.add(clave);
    } else if (description.trim()) {
      sinMatch.push(description.trim());
    }
  }

  return {
    claves: Array.from(matched).sort(),
    sinMatch,
  };
}

/**
 * Atajo que solo devuelve claves (compatibilidad).
 */
export function matchRegimenDescriptionsToClaves(
  descriptions: string[],
  catalog: Record<string, string> = SAT_REGIMENES
): string[] {
  return matchRegimenDescriptions(descriptions, catalog).claves;
}
