// Accent- and case-insensitive folding used by search (and later by the workshop matcher).
const LIGATURES: Record<string, string> = { 'œ': 'oe', 'æ': 'ae', 'ß': 'ss' };

export function fold(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[œæß]/g, (c) => LIGATURES[c])
    .replace(/[`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Query terms: folded, split on spaces, empties dropped. */
export function terms(query: string): string[] {
  const f = fold(query);
  return f ? f.split(' ') : [];
}
