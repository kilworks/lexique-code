import { describe, expect, it } from 'vitest';
import { answer, dayKey, dayNumber, dueCards, INTERVALS, isDue, markMistakes, nextDue, parseDay, parseState, type SrsState } from './srs';

const now = new Date(2026, 10, 17, 9, 30); // 2026-11-17 local
const today = dayNumber(now);

describe('day math', () => {
  it('uses the local calendar day, whatever the clock time', () => {
    expect(dayKey(dayNumber(new Date(2026, 10, 17, 0, 0, 1)))).toBe('2026-11-17');
    expect(dayKey(dayNumber(new Date(2026, 10, 17, 23, 59, 59)))).toBe('2026-11-17');
  });
  it('counts whole days across a DST change', () => {
    // late March and late October switch clocks in Europe; the count must stay 1 per calendar day
    expect(dayNumber(new Date(2026, 2, 30, 0, 30)) - dayNumber(new Date(2026, 2, 28, 23, 30))).toBe(2);
    expect(dayKey(dayNumber(new Date(2026, 9, 25, 12)) + 1)).toBe('2026-10-26');
  });
  it('parses only real YYYY-MM-DD days', () => {
    expect(parseDay('2026-11-17')).toBe(today);
    expect(parseDay('2026-02-31')).toBeNull();
    expect(parseDay('2026-1-7')).toBeNull();
    expect(parseDay(20261117)).toBeNull();
    expect(parseDay(undefined)).toBeNull();
  });
});

describe('parseState', () => {
  it('returns an empty state for garbage', () => {
    expect(parseState(null)).toEqual({});
    expect(parseState([{ box: 1 }])).toEqual({});
    expect(parseState('x')).toEqual({});
  });
  it('drops bad boxes and turns a bad due into due now', () => {
    const raw = { a: { box: 3, due: '2026-11-20' }, b: { box: 0 }, c: { box: 6 }, d: { box: 2.5 }, e: { box: 1, due: 'soon' }, f: 'x' };
    expect(parseState(raw)).toEqual({ a: { box: 3, due: '2026-11-20' }, e: { box: 1, due: '' } });
  });
});

describe('answer', () => {
  it('moves a new card to box 2, due tomorrow', () => {
    expect(answer({}, 'a', true, now).a).toEqual({ box: 2, due: dayKey(today + 1) });
  });
  it('follows the intervals 0/1/3/7/16 box by box', () => {
    let s: SrsState = {};
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      s = answer(s, 'a', true, now);
      seen.push(parseDay(s.a.due)! - today);
    }
    expect(seen).toEqual([INTERVALS[1], INTERVALS[2], INTERVALS[3], INTERVALS[4]]);
    expect(s.a.box).toBe(5);
  });
  it('keeps box 5 at box 5', () => {
    const s = answer({ a: { box: 5, due: '2026-11-01' } }, 'a', true, now);
    expect(s.a).toEqual({ box: 5, due: dayKey(today + 16) });
  });
  it('sends a wrong answer to box 1, due today, from any box', () => {
    for (const box of [1, 3, 5]) {
      expect(answer({ a: { box, due: '' } }, 'a', false, now).a).toEqual({ box: 1, due: dayKey(today) });
    }
  });
  it('does not mutate the input', () => {
    const s: SrsState = { a: { box: 2, due: '' } };
    answer(s, 'a', true, now);
    expect(s).toEqual({ a: { box: 2, due: '' } });
  });
});

describe('dueCards', () => {
  it('handles an empty deck', () => {
    expect(dueCards([], {}, now)).toEqual([]);
    expect(nextDue([], {}, now)).toBeNull();
  });
  it('puts overdue reviewed cards first, then new cards in deck order, skips future cards and duplicates', () => {
    const s: SrsState = {
      a: { box: 3, due: dayKey(today - 2) },
      b: { box: 1, due: dayKey(today) },
      c: { box: 2, due: dayKey(today + 1) },
      d: { box: 1, due: dayKey(today - 2) },
      e: { box: 2, due: '' },
    };
    expect(dueCards(['n1', 'a', 'b', 'c', 'd', 'n2', 'e', 'n1'], s, now)).toEqual(['e', 'd', 'a', 'b', 'n1', 'n2']);
  });
  it('caps the session, cutting new cards first', () => {
    const s: SrsState = { a: { box: 1, due: '' } };
    expect(dueCards(['n1', 'n2', 'a'], s, now, 2)).toEqual(['a', 'n1']);
    expect(dueCards(['a'], s, now, 0)).toEqual([]);
  });
  it('ignores inherited keys such as toString', () => {
    expect(dueCards(['toString'], {}, now)).toEqual(['toString']);
  });
  it('reports the next due day when nothing is due', () => {
    const s: SrsState = { a: { box: 2, due: dayKey(today + 3) }, b: { box: 3, due: dayKey(today + 1) } };
    expect(dueCards(['a', 'b'], s, now)).toEqual([]);
    expect(nextDue(['a', 'b'], s, now)).toBe(dayKey(today + 1));
  });
});

describe('markMistakes', () => {
  it('puts quiz mistakes in box 1, due today, readable by parseState', () => {
    const s = markMistakes({ a: { box: 4, due: dayKey(today + 7) } }, ['a', 'b'], now);
    expect(parseState(JSON.parse(JSON.stringify(s)))).toEqual({ a: { box: 1, due: dayKey(today) }, b: { box: 1, due: dayKey(today) } });
    expect(isDue(s.a, today)).toBe(true);
  });
});
