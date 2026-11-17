import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { isLang, isStringArray, isTheme, KEYS, read, write, type ThemeChoice } from '../lib/storage';
import type { Lang } from '../lib/types';

interface Prefs {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** 'system' follows prefers-color-scheme through tokens.css */
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  myCards: string[];
  toggleCard: (id: string) => void;
  /** false when the last write could not reach localStorage */
  saved: boolean;
}

const Ctx = createContext<Prefs | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => read(KEYS.lang, 'en', isLang));
  const [theme, setThemeState] = useState<ThemeChoice>(() => read<ThemeChoice>(KEYS.theme, 'system', isTheme));
  const [myCards, setMyCards] = useState<string[]>(() => read(KEYS.myCards, [], isStringArray));
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    setSaved(write(KEYS.lang, l));
  }, []);

  const setTheme = useCallback((t: ThemeChoice) => {
    setThemeState(t);
    setSaved(write(KEYS.theme, t));
  }, []);

  const toggleCard = useCallback((id: string) => {
    setMyCards((cur) => {
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      setSaved(write(KEYS.myCards, next));
      return next;
    });
  }, []);

  const value = useMemo(() => ({ lang, setLang, theme, setTheme, myCards, toggleCard, saved }), [lang, setLang, theme, setTheme, myCards, toggleCard, saved]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs(): Prefs {
  const v = useContext(Ctx);
  if (!v) throw new Error('usePrefs outside PrefsProvider');
  return v;
}
