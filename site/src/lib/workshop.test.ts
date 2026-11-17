import { describe, expect, it } from 'vitest';
import real from '../data/lexicon.json';
import { buildMatcher, detect, detectedWords, suggest } from './workshop';
import type { Lexicon, Word } from './types';

const word = (id: string, en: string[], fr: string[]): Word => ({
  id, section: 's',
  en: { word: en[0], meaning: '', action: `do ${id}` },
  fr: { word: fr[0], meaning: '', action: `faire ${id}` },
  aliases: { en, fr },
});

const lex: Lexicon = {
  sections: [{ id: 's', title: { en: 'S', fr: 'S' }, kind: 'words', words: [] }],
  words: {
    'root-cause': word('root-cause', ['root cause'], ['cause racine']),
    cause: word('cause', ['cause'], ['cause']),
    idempotent: word('idempotent', ['idempotent'], ['idempotent']),
    'regression-test': word('regression-test', ['regression test'], ['non-régression']),
    'hyphen-minus-hyphen-minus': word('hyphen-minus-hyphen-minus', ['--'], ['--']),
    effort: word('effort', ['/effort'], ['/effort']),
    'dry-run': word('dry-run', ['dry-run'], ['dry-run']),
    atomic: word('atomic', ['atomic'], ['atomique']),
  },
  combinations: [
    { id: 'c1', en: { phrase: 'root cause + regression test', result: 'r' }, fr: { phrase: 'p', result: 'r' }, words: ['root-cause', 'regression-test'] },
    { id: 'c2', en: { phrase: 'idempotent + atomic + dry-run', result: 'r' }, fr: { phrase: 'p', result: 'r' }, words: ['idempotent', 'atomic', 'dry-run'] },
    { id: 'c3', en: { phrase: 'atomic + raw', result: 'r' }, fr: { phrase: 'p', result: 'r' }, words: ['atomic', 'raw term'] },
  ],
};
const m = buildMatcher(lex);
const found = (text: string) => detect(text, m).map((h) => [text.slice(h.start, h.end), h.words.join(',')]);

describe('detect', () => {
  it('returns nothing for empty or blank text', () => {
    expect(detect('', m)).toEqual([]);
    expect(detect('   \n ', m)).toEqual([]);
  });

  it('is case- and accent-insensitive and keeps original offsets', () => {
    expect(found('Add a NON-REGRESSION test')).toEqual([['NON-REGRESSION', 'regression-test']]);
    expect(found('écris un test de non-régression')).toEqual([['non-régression', 'regression-test']]);
  });

  it('takes the longest match and never overlaps', () => {
    expect(found('find the Root  Cause first')).toEqual([['Root  Cause', 'root-cause']]);
    expect(found('the cause, then the root cause')).toEqual([['cause', 'cause'], ['root cause', 'root-cause']]);
  });

  it('respects word boundaries, hyphens included', () => {
    expect(found('idempotently')).toEqual([]);
    expect(found('a non-idempotent call')).toEqual([]);
    expect(found('Idempotent.')).toEqual([['Idempotent', 'idempotent']]);
  });

  it('matches symbol words and only as whole tokens', () => {
    expect(found('run git checkout -- file and /effort high')).toEqual([['--', 'hyphen-minus-hyphen-minus'], ['/effort', 'effort']]);
    expect(found('use --force or ---')).toEqual([]);
    expect(found('`--`')).toEqual([['--', 'hyphen-minus-hyphen-minus']]);
  });

  it('matches FR aliases and multiword aliases across line breaks', () => {
    expect(found("trouve la cause\nracine, opération atomique")).toEqual([['cause\nracine', 'root-cause'], ['atomique', 'atomic']]);
  });

  it('handles astral characters without shifting offsets', () => {
    const text = 'x \u{1F600} idempotent';
    expect(found(text)).toEqual([['idempotent', 'idempotent']]);
  });

  it('stays fast on a 5k-char text against the real lexicon', () => {
    const rm = buildMatcher(real as Lexicon);
    const text = 'Make the deploy script idempotent and atomic, add a dry-run, find the root cause, '.repeat(62).slice(0, 5000);
    const t0 = performance.now();
    const hits = detect(text, rm);
    const ms = performance.now() - t0;
    expect(hits.length).toBeGreaterThan(100);
    expect(ms).toBeLessThan(500);
  });
});

describe('suggest', () => {
  it('lists combinations sharing a detected word, most shared first, with what is missing', () => {
    const s = suggest(lex, detectedWords(detect('make it idempotent and atomic', m)));
    expect(s.map((x) => [x.combination.id, x.missing])).toEqual([
      ['c2', ['dry-run']],
      ['c3', ['raw term']],
    ]);
  });
  it('returns nothing when no word is detected', () => {
    expect(suggest(lex, [])).toEqual([]);
  });
});
