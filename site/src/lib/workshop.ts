import { fold } from './normalize';
import type { Combination, Lexicon } from './types';

export interface Hit {
  /** offsets in the original text, end exclusive */
  start: number;
  end: number;
  /** usually one id; an alias shared by several words lists them all */
  words: string[];
}

export interface Suggestion {
  combination: Combination;
  /** ids (or raw terms) of the combination already in the text */
  present: string[];
  /** ids (or raw terms) still to add */
  missing: string[];
}

interface Entry { alias: string; words: string[] }
export interface Matcher { entries: Entry[] }

// Halves of `a / b` words that are everyday words: alone they say nothing about the lexicon word
// (`plan before coding` is not `before / after`). The full `a / b` form still matches.
const STOP = new Set(['before', 'after', 'avant', 'apres', 'quick', 'rapide', 'total', 'map', 'carte', 'empty', 'vide', 'missing', 'absent', 'null', 'nul', 'act', 'pre', 'pub', 'sub', 'local', 'permanent']);

/** Extra spellings a learner writes: the full `a / b` cell (with or without spaces), `x and y` / `x et y` and plain `x` for `x + y`. */
function variants(w: Lexicon['words'][string]): string[] {
  const out: string[] = [];
  for (const cell of [w.en.word, w.fr.word]) {
    if (cell.includes(' / ')) out.push(cell, cell.replaceAll(' / ', '/'));
  }
  for (const a of [...w.aliases.en, ...w.aliases.fr]) {
    if (!a.includes(' + ')) continue;
    out.push(a.replaceAll(' + ', ' and '), a.replaceAll(' + ', ' et '), a.split(' + ')[0]);
  }
  return out;
}

/** Every EN and FR alias, folded, longest first (ties alphabetical so results are stable). */
export function buildMatcher(lex: Lexicon): Matcher {
  const map = new Map<string, string[]>();
  for (const w of Object.values(lex.words)) {
    for (const a of [...w.aliases.en, ...w.aliases.fr, ...variants(w)]) {
      const f = fold(a);
      if (!f || STOP.has(f)) continue;
      const ids = map.get(f) ?? [];
      if (!ids.includes(w.id)) ids.push(w.id);
      map.set(f, ids);
    }
  }
  const entries = [...map].map(([alias, words]) => ({ alias, words }));
  entries.sort((a, b) => b.alias.length - a.alias.length || (a.alias < b.alias ? -1 : 1));
  return { entries };
}

/** Folds char by char so each folded index points back to its original offset. */
function foldWithMap(text: string): { folded: string; starts: number[]; ends: number[] } {
  let folded = '';
  const starts: number[] = [];
  const ends: number[] = [];
  let i = 0;
  for (const ch of text) {
    const piece = /\s/.test(ch) ? (folded.endsWith(' ') ? '' : ' ') : fold(ch);
    for (let k = 0; k < piece.length; k++) {
      starts.push(i);
      ends.push(i + ch.length);
    }
    folded += piece;
    i += ch.length;
  }
  return { folded, starts, ends };
}

// A hyphen counts as part of a word, so `idempotent` does not fire inside `non-idempotent`
// and `--` does not fire inside `--force` or `---`.
const WORDISH = /[\p{L}\p{N}_-]/u;

/** Non-overlapping hits in text order; a longer alias wins over any shorter one it overlaps. */
export function detect(text: string, matcher: Matcher): Hit[] {
  if (!text.trim()) return [];
  const { folded, starts, ends } = foldWithMap(text);
  const taken = new Uint8Array(folded.length);
  const hits: Hit[] = [];
  for (const { alias, words } of matcher.entries) {
    let from = 0;
    for (let at = folded.indexOf(alias, from); at !== -1; at = folded.indexOf(alias, from)) {
      const end = at + alias.length;
      from = at + 1;
      if (at > 0 && WORDISH.test(folded[at - 1])) continue;
      if (end < folded.length && WORDISH.test(folded[end])) continue;
      if (taken.subarray(at, end).some((x) => x)) continue;
      taken.fill(1, at, end);
      hits.push({ start: starts[at], end: ends[end - 1], words });
    }
  }
  return hits.sort((a, b) => a.start - b.start);
}

/** Distinct word ids in order of first appearance. */
export function detectedWords(hits: Hit[]): string[] {
  return [...new Set(hits.flatMap((h) => h.words))];
}

/** Combinations sharing 1+ detected word, most shared first, then fewest missing, then lexicon order. */
export function suggest(lex: Lexicon, detected: string[]): Suggestion[] {
  const have = new Set(detected);
  return lex.combinations
    .map((combination, order) => ({
      combination,
      order,
      present: combination.words.filter((w) => have.has(w)),
      missing: combination.words.filter((w) => !have.has(w)),
    }))
    .filter((s) => s.present.length > 0)
    .sort((a, b) => b.present.length - a.present.length || a.missing.length - b.missing.length || a.order - b.order)
    .map(({ combination, present, missing }) => ({ combination, present, missing }));
}
