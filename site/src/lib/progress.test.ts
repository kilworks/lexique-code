import { describe, expect, it } from 'vitest';
import { dayIndex, summarize } from './progress';

const words = new Set(['a', 'b', 'c']);
const sections = new Set(['s1', 's2']);

describe('summarize', () => {
  it('returns zeros when storage is absent or garbage', () => {
    const zero = { studied: 0, mastered: 0, quizzes: 0, perfect: 0 };
    expect(summarize(undefined, null, words, sections)).toEqual(zero);
    expect(summarize([1, 2], 'x', words, sections)).toEqual(zero);
    expect(summarize({ a: 3 }, { s1: 'nope' }, words, sections)).toEqual(zero);
  });
  it('counts known ids only, mastered at box 5, perfect when best reaches total', () => {
    const srs = { a: { box: 5 }, b: { box: 2 }, gone: { box: 5 }, c: { box: 'x' } };
    const quiz = { s1: { best: 10, total: 10 }, s2: { best: 7, total: 10 }, old: { best: 10, total: 10 } };
    expect(summarize(srs, quiz, words, sections)).toEqual({ studied: 3, mastered: 1, quizzes: 2, perfect: 1 });
  });
});

describe('dayIndex', () => {
  it('is stable within a day and changes the next day', () => {
    const a = dayIndex(528, new Date(2026, 10, 17, 1));
    expect(dayIndex(528, new Date(2026, 10, 17, 23))).toBe(a);
    expect(dayIndex(528, new Date(2026, 10, 18, 1))).not.toBe(a);
  });
  it('stays in range, including empty and a count sharing a factor with the step', () => {
    expect(dayIndex(0, new Date())).toBe(-1);
    const seen = new Set<number>();
    for (let d = 0; d < 7919 * 2; d++) seen.add(dayIndex(7919 * 2, new Date(2000, 0, 1 + d)));
    expect(seen.size).toBe(7919 * 2);
  });
});
