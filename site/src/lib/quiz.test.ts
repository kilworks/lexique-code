import { describe, expect, it } from 'vitest';
import real from '../data/lexicon.json';
import { fold } from './normalize';
import { bestOf, chunk, makeQuiz, markMistakes, mistakes, nextLesson, pathOrder, recordScore, rng, sectionCombos, today, type Question } from './quiz';
import type { Combination, Lexicon, Word } from './types';

const w = (id: string, section: string, word = id, meaning = `${id} meaning`, action = `${id} action`): Word => ({
  id, section,
  en: { word, meaning, action },
  fr: { word: `${word} fr`, meaning: `${meaning} fr`, action: `${action} fr` },
  aliases: { en: [word], fr: [word] },
});

function lexicon(sections: Record<string, string[]>, combos: Combination[] = [], extra: Word[] = []): Lexicon {
  const words: Record<string, Word> = {};
  for (const [s, ids] of Object.entries(sections)) for (const id of ids) words[id] = w(id, s);
  for (const x of extra) words[x.id] = x;
  return {
    sections: [
      ...Object.entries(sections).map(([id, ids]) => ({ id, title: { en: id, fr: id }, kind: 'words' as const, words: ids })),
      { id: 'combinations', title: { en: 'Combinations', fr: 'Combinaisons' }, kind: 'combinations' as const, words: [] },
    ],
    words,
    combinations: combos,
  };
}

const combo = (id: string, words: string[]): Combination => ({
  id, words,
  en: { phrase: words.join(' + '), result: `${id} result` },
  fr: { phrase: words.join(' + '), result: `${id} fr` },
});

const ids = (prefix: string, n: number) => Array.from({ length: n }, (_, i) => `${prefix}${i}`);

function checkQuiz(lex: Lexicon, qs: Question[]) {
  const answers = qs.map((q) => q.answer);
  expect(new Set(answers).size).toBe(answers.length);
  for (const q of qs) {
    expect(q.options).toHaveLength(4);
    expect(new Set(q.options).size).toBe(4);
    expect(q.options).toContain(q.answer);
    for (const l of ['en', 'fr'] as const) {
      const texts = q.options.map((o) => fold(lex.words[o][l][q.show]));
      expect(new Set(texts).size).toBe(4);
    }
  }
}

describe('rng', () => {
  it('is deterministic and in [0, 1)', () => {
    const a = rng(42), b = rng(42);
    for (let i = 0; i < 100; i++) {
      const x = a();
      expect(x).toBe(b());
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });
});

describe('makeQuiz', () => {
  const lex = lexicon({ a: ids('a', 15), b: ids('b', 12) });

  it('gives the same quiz for the same seed and a different one for another seed', () => {
    expect(makeQuiz(lex, 'a', 7)).toEqual(makeQuiz(lex, 'a', 7));
    expect(makeQuiz(lex, 'a', 7)).not.toEqual(makeQuiz(lex, 'a', 8));
  });

  it('asks 10 questions, 4 distinct options, never the same answer twice, distractors from the section', () => {
    for (let seed = 0; seed < 50; seed++) {
      const qs = makeQuiz(lex, 'a', seed);
      expect(qs).toHaveLength(10);
      checkQuiz(lex, qs);
      for (const q of qs) for (const o of q.options) expect(lex.words[o].section).toBe('a');
    }
  });

  it('uses the three word question kinds', () => {
    const kinds = new Set(Array.from({ length: 20 }, (_, s) => makeQuiz(lex, 'a', s)).flat().map((q) => q.kind));
    expect(kinds).toEqual(new Set(['word-for-action', 'meaning-of-word', 'action-for-word']));
  });

  it('caps the length at the word count when the section is short', () => {
    const qs = makeQuiz(lexicon({ a: ids('a', 6), b: ids('b', 10) }), 'a', 1);
    expect(qs).toHaveLength(6);
  });

  it('borrows distractors from other sections when the section has fewer than 4 words', () => {
    const small = lexicon({ tiny: ['t0', 't1'], b: ids('b', 10) });
    const qs = makeQuiz(small, 'tiny', 3);
    expect(qs).toHaveLength(2);
    checkQuiz(small, qs);
    for (const q of qs) expect(q.options.filter((o) => small.words[o].section === 'b').length).toBeGreaterThanOrEqual(2);
  });

  it('drops a question rather than show two options with the same text', () => {
    // only 3 distinct meanings in the whole lexicon: no meaning question can have 4 options
    const same = lexicon({ a: [] }, [], [w('x0', 'a', 'x0', 'same'), w('x1', 'a', 'x1', 'same'), w('x2', 'a', 'x2', 'other'), w('x3', 'a', 'x3', 'third')]);
    same.sections[0].words = ['x0', 'x1', 'x2', 'x3'];
    for (let s = 0; s < 30; s++) {
      const qs = makeQuiz(same, 'a', s);
      expect(qs.every((q) => q.kind !== 'meaning-of-word')).toBe(true);
      checkQuiz(same, qs);
    }
  });

  it('returns nothing for an unknown section, the combinations section or an empty one', () => {
    expect(makeQuiz(lex, 'nope', 1)).toEqual([]);
    expect(makeQuiz(lex, 'combinations', 1)).toEqual([]);
    expect(makeQuiz(lexicon({ e: [], b: ids('b', 5) }), 'e', 1)).toEqual([]);
  });
});

describe('complete the combination', () => {
  const sections = { a: ids('a', 12), b: ids('b', 12) };

  it('appears when 2+ combinations involve the section, blanking a word of the section', () => {
    const lex = lexicon(sections, [combo('c1', ['a0', 'b0']), combo('c2', ['a1', 'a2', 'raw term']), combo('c3', ['b1', 'b2'])]);
    expect(sectionCombos(lex, 'a').map((c) => c.id)).toEqual(['c1', 'c2']);
    for (let s = 0; s < 30; s++) {
      const qs = makeQuiz(lex, 'a', s);
      const cq = qs.filter((q) => q.kind === 'complete-combination');
      expect(cq).toHaveLength(2);
      expect(qs).toHaveLength(10);
      checkQuiz(lex, qs);
      for (const q of cq) {
        const c = lex.combinations.find((x) => x.id === q.combo!.id)!;
        expect(c.words[q.combo!.blank]).toBe(q.answer);
        expect(lex.words[q.answer].section).toBe('a');
        // the other terms of the combination are never offered as distractors
        for (const o of q.options) if (o !== q.answer) expect(c.words).not.toContain(o);
      }
    }
  });

  it('never offers a distractor that forms another combination with a given term', () => {
    // c1 blanks a0 or a1; a2..a5 combine with a1 elsewhere, so they would also look right
    const lex = lexicon(sections, [combo('c1', ['a0', 'a1']), combo('c2', ['a1', 'a2', 'a3']), combo('c3', ['a1', 'a4', 'a5'])]);
    for (let s = 0; s < 40; s++) {
      for (const q of makeQuiz(lex, 'a', s).filter((x) => x.combo?.id === 'c1')) {
        if (q.answer !== 'a0') continue;
        for (const o of q.options) if (o !== q.answer) expect(['a1', 'a2', 'a3', 'a4', 'a5']).not.toContain(o);
      }
    }
  });

  it('does not appear with a single combination', () => {
    const lex = lexicon(sections, [combo('c1', ['a0', 'a1'])]);
    for (let s = 0; s < 20; s++) expect(makeQuiz(lex, 'a', s).some((q) => q.kind === 'complete-combination')).toBe(false);
  });
});

describe('lesson step check', () => {
  it('asks only about the given words, with distractors from the section and no combination', () => {
    const lex = lexicon({ a: ids('a', 12), b: ids('b', 12) }, [combo('c1', ['a0', 'b0']), combo('c2', ['a1', 'b1'])]);
    for (let s = 0; s < 20; s++) {
      const qs = makeQuiz(lex, 'a', s, 2, ['a3', 'a4', 'a5']);
      expect(qs).toHaveLength(2);
      checkQuiz(lex, qs);
      for (const q of qs) {
        expect(['a3', 'a4', 'a5']).toContain(q.answer);
        expect(q.kind).not.toBe('complete-combination');
      }
    }
  });
});

describe('mistakes', () => {
  it('lists the answers of wrong or skipped questions', () => {
    const qs = makeQuiz(lexicon({ a: ids('a', 8), b: ids('b', 8) }), 'a', 5, 3);
    const picks = [qs[0].answer, qs[1].options.find((o) => o !== qs[1].answer)!, null];
    expect(mistakes(qs, picks)).toEqual([qs[1].answer, qs[2].answer]);
  });
});

describe('real lexicon', () => {
  const lex = real as unknown as Lexicon;
  it('builds a valid quiz for every word section', () => {
    for (const s of lex.sections.filter((x) => x.kind === 'words')) {
      for (const seed of [1, 2, 3]) {
        const qs = makeQuiz(lex, s.id, seed);
        expect(qs.length, s.id).toBe(Math.min(10, s.words.length));
        checkQuiz(lex, qs);
        if (sectionCombos(lex, s.id).length >= 2) expect(qs.some((q) => q.kind === 'complete-combination'), s.id).toBe(true);
      }
    }
  });
});

describe('path and lesson helpers', () => {
  it('puts the five core sections first, then the rest in order, without combinations', () => {
    const s = ['x', 'security', 'method', 'y', 'operations', 'verification', 'robustness', 'z'].map((id) => ({ id, kind: 'words' }));
    s.push({ id: 'combinations', kind: 'combinations' });
    expect(pathOrder(s).map((x) => x.id)).toEqual(['method', 'robustness', 'verification', 'security', 'operations', 'x', 'y', 'z']);
  });

  it('points to the first lesson of the path whose quiz was never taken', () => {
    const s = ['x', 'method', 'robustness'].map((id) => ({ id, kind: 'words' }));
    expect(nextLesson(s, null)?.id).toBe('method');
    expect(nextLesson(s, { method: { best: 3, total: 10 } })?.id).toBe('robustness');
    expect(nextLesson(s, { method: { best: 3, total: 10 }, robustness: { best: 1, total: 10 }, x: { best: 0, total: 10 } })).toBeNull();
    expect(nextLesson(s, 'junk')?.id).toBe('method');
  });

  it('splits into balanced groups of about 6', () => {
    expect(chunk([]).length).toBe(0);
    expect(chunk(ids('w', 5)).map((g) => g.length)).toEqual([5]);
    expect(chunk(ids('w', 13)).map((g) => g.length)).toEqual([5, 4, 4]);
    expect(chunk(ids('w', 38)).map((g) => g.length)).toEqual([6, 6, 6, 5, 5, 5, 5]);
    expect(chunk(ids('w', 12)).map((g) => g.length)).toEqual([6, 6]);
    for (const n of [1, 7, 12, 36, 42]) expect(chunk(ids('w', n)).flat()).toEqual(ids('w', n));
  });

  it('keeps the best score and survives garbage', () => {
    expect(recordScore('junk', 'a', 3, 10)).toEqual({ a: { best: 3, total: 10 } });
    const one = recordScore({ b: 1 }, 'a', 7, 10);
    expect(one).toEqual({ b: 1, a: { best: 7, total: 10 } });
    expect(recordScore(one, 'a', 5, 10).a).toEqual({ best: 7, total: 10 });
    expect(recordScore(one, 'a', 9, 10).a).toEqual({ best: 9, total: 10 });
    expect(bestOf({ a: { best: 1, total: 0 } }, 'a')).toBeNull();
    expect(bestOf([], 'a')).toBeNull();
    expect(bestOf({}, 'constructor')).toBeNull();
  });

  it('sends mistakes back to box 1, due today', () => {
    expect(today(new Date(2026, 0, 5))).toBe('2026-01-05');
    const next = markMistakes({ a: { box: 4, due: '2030-01-01', seen: 3 }, b: { box: 2 }, c: 'junk' }, ['a', 'c', 'd'], '2026-11-17');
    expect(next).toEqual({ a: { box: 1, due: '2026-11-17', seen: 3 }, b: { box: 2 }, c: { box: 1, due: '2026-11-17' }, d: { box: 1, due: '2026-11-17' } });
    expect(markMistakes(null, [], 'x')).toEqual({});
  });
});
