import { fold, terms } from './normalize';
import type { Combination, Lang, Lexicon, Section, Word } from './types';

export interface SearchGroup { section: Section; words: Word[] }
export interface SearchResult { groups: SearchGroup[]; count: number; combinations: Combination[] }

function haystack(w: Word, lang: Lang): string {
  const r = w[lang];
  return fold([r.word, ...w.aliases[lang], r.meaning, r.action].join(' \n '));
}

/**
 * Every query term must appear in the word, its aliases, meaning or action (current language).
 * Empty query returns everything. `sections` empty means all sections.
 * Groups and words keep the lexicon order.
 */
export function search(lex: Lexicon, query: string, lang: Lang, sections: string[] = []): SearchResult {
  const q = terms(query);
  const keep = (s: Section) => sections.length === 0 || sections.includes(s.id);
  const groups: SearchGroup[] = [];
  let count = 0;
  for (const section of lex.sections) {
    if (section.kind !== 'words' || !keep(section)) continue;
    const words = section.words
      .map((id) => lex.words[id])
      .filter((w) => {
        if (!w) return false;
        if (!q.length) return true;
        const h = haystack(w, lang);
        return q.every((t) => h.includes(t));
      });
    if (words.length) {
      groups.push({ section, words });
      count += words.length;
    }
  }
  const comboSection = lex.sections.find((s) => s.kind === 'combinations');
  const combinations = q.length && comboSection && keep(comboSection)
    ? lex.combinations.filter((c) => {
        const h = fold(`${c[lang].phrase} \n ${c[lang].result}`);
        return q.every((t) => h.includes(t));
      })
    : [];
  return { groups, count, combinations };
}
