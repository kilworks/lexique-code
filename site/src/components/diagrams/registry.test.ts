import { describe, expect, it } from 'vitest';
import lex from '../../data/lexicon.json';
import { DIAGRAM_IDS } from './index';
import { REGISTRY_IDS } from './Registry';

describe('diagram registry', () => {
  it('the word-page list and the lazy registry name the same words', () => {
    expect([...DIAGRAM_IDS].sort()).toEqual([...REGISTRY_IDS].sort());
  });
  it('every id is a real word of the lexicon', () => {
    for (const id of DIAGRAM_IDS) expect(Object.hasOwn(lex.words, id), id).toBe(true);
  });
  it('covers 8 to 12 words', () => {
    expect(DIAGRAM_IDS.length).toBeGreaterThanOrEqual(8);
    expect(DIAGRAM_IDS.length).toBeLessThanOrEqual(12);
  });
});
