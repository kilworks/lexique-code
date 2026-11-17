import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Lexicon } from '../lib/types';

type State = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; lex: Lexicon };

const Ctx = createContext<State>({ status: 'loading' });

// The lexicon (with enrichment) is its own chunk so the shell paints before it arrives.
export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    import('../data/lexicon.json')
      .then((m) => live && setState({ status: 'ready', lex: m.default as Lexicon }))
      .catch((e: unknown) => live && setState({ status: 'error', message: e instanceof Error ? e.message : String(e) }));
    return () => { live = false; };
  }, []);
  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);

/** For pages rendered only once data is ready (see DataGate in App). */
export function useLexicon(): Lexicon {
  const s = useContext(Ctx);
  if (s.status !== 'ready') throw new Error('useLexicon before data is ready');
  return s.lex;
}
