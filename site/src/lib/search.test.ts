import { describe, expect, it } from 'vitest';
import { search } from './search';
import type { Lexicon, Word } from './types';

const word = (id: string, section: string, en: [string, string, string], fr: [string, string, string], aliases: { en: string[]; fr: string[] }): Word => ({
  id, section,
  en: { word: en[0], meaning: en[1], action: en[2] },
  fr: { word: fr[0], meaning: fr[1], action: fr[2] },
  aliases,
});

const lex: Lexicon = {
  sections: [
    { id: 'debugging', title: { en: 'Debugging', fr: 'Débogage' }, kind: 'words', words: ['root-cause', 'bisect'] },
    { id: 'shell', title: { en: 'Shell', fr: 'Shell' }, kind: 'words', words: ['hyphen-minus-hyphen-minus', 'skim-quick'] },
    { id: 'combinations', title: { en: 'Combinations', fr: 'Combinaisons' }, kind: 'combinations', words: [] },
  ],
  words: {
    'root-cause': word('root-cause', 'debugging', ['root cause', 'the cause, not the symptom', 'trace back'], ['cause racine', 'la cause, pas le symptôme', 'remonter'], { en: ['root cause'], fr: ['cause racine'] }),
    bisect: word('bisect', 'debugging', ['bisect', 'cut the history in half', '`git bisect`'], ['bisection', "couper l'historique en deux", '`git bisect`'], { en: ['bisect'], fr: ['bisection'] }),
    'hyphen-minus-hyphen-minus': word('hyphen-minus-hyphen-minus', 'shell', ['`--`', 'end of options', 'put `--` before paths'], ['`--`', 'fin des options', 'mettre `--` avant les chemins'], { en: ['--'], fr: ['--'] }),
    'skim-quick': word('skim-quick', 'shell', ['skim / quick', 'the essentials', 'a few lines'], ['survol / rapide', "l'essentiel", 'quelques lignes'], { en: ['skim', 'quick'], fr: ['survol', 'rapide'] }),
  },
  combinations: [
    { id: 'root-cause-bisect', en: { phrase: 'root cause + bisect', result: 'a bug found fast' }, fr: { phrase: 'cause racine + bisection', result: 'un bug trouvé vite' }, words: ['root-cause', 'bisect'] },
  ],
};

const ids = (r: ReturnType<typeof search>) => r.groups.flatMap((g) => g.words.map((w) => w.id));

describe('search', () => {
  it('empty query returns every word, grouped in lexicon order, no combinations', () => {
    const r = search(lex, '', 'en');
    expect(r.count).toBe(4);
    expect(r.groups.map((g) => g.section.id)).toEqual(['debugging', 'shell']);
    expect(r.combinations).toEqual([]);
  });
  it('is accent and case insensitive in the current language', () => {
    expect(ids(search(lex, 'SYMPTOME', 'fr'))).toEqual(['root-cause']);
    expect(ids(search(lex, 'symptome', 'en'))).toEqual([]);
  });
  it('matches aliases', () => {
    expect(ids(search(lex, 'quick', 'en'))).toEqual(['skim-quick']);
    expect(ids(search(lex, 'rapide', 'fr'))).toEqual(['skim-quick']);
  });
  it('finds symbol words like --', () => {
    expect(ids(search(lex, '--', 'en'))).toEqual(['hyphen-minus-hyphen-minus']);
    expect(ids(search(lex, '`--`', 'en'))).toEqual(['hyphen-minus-hyphen-minus']);
  });
  it('requires every term (AND) across fields', () => {
    expect(ids(search(lex, 'git history', 'en'))).toEqual(['bisect']);
    expect(ids(search(lex, 'git symptom', 'en'))).toEqual([]);
  });
  it('filters by section and reports zero results cleanly', () => {
    expect(ids(search(lex, '', 'en', ['shell']))).toEqual(['hyphen-minus-hyphen-minus', 'skim-quick']);
    const none = search(lex, 'zzz', 'en');
    expect(none.count).toBe(0);
    expect(none.groups).toEqual([]);
  });
  it('searches combinations only with a query and when their section is kept', () => {
    expect(search(lex, 'bug', 'en').combinations.map((c) => c.id)).toEqual(['root-cause-bisect']);
    expect(search(lex, 'trouve', 'fr').combinations.length).toBe(1);
    expect(search(lex, 'bug', 'en', ['debugging']).combinations).toEqual([]);
  });
});
