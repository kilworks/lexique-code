// localStorage that never throws: private mode, blocked storage or no window all fall back to defaults.
function store(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

export function read<T>(key: string, fallback: T, guard?: (v: unknown) => v is T): T {
  try {
    const raw = store()?.getItem(key);
    if (raw == null) return fallback;
    const value: unknown = JSON.parse(raw);
    if (guard && !guard(value)) return fallback;
    return value as T;
  } catch {
    return fallback;
  }
}

/** Returns false when the value could not be stored. */
export function write(key: string, value: unknown): boolean {
  try {
    const s = store();
    if (!s) return false;
    s.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string');
export const isLang = (v: unknown): v is 'en' | 'fr' => v === 'en' || v === 'fr';
export type ThemeChoice = 'light' | 'dark' | 'system';
export const isTheme = (v: unknown): v is ThemeChoice => v === 'light' || v === 'dark' || v === 'system';

// Full localStorage keys, shared by every page (versioned so a shape change can move to v2).
export const KEYS = {
  lang: 'lexicon.lang.v1',
  theme: 'lexicon.theme.v1',
  myCards: 'lexicon.mycards.v1',
  srs: 'lexicon.srs.v1',
  quiz: 'lexicon.quiz.v1',
} as const;
