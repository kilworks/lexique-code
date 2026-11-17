import { describe, expect, it } from 'vitest';
import { fold, terms } from './normalize';

describe('fold', () => {
  it('handles empty and blank input', () => {
    expect(fold('')).toBe('');
    expect(fold('   \n\t ')).toBe('');
    expect(terms('   ')).toEqual([]);
  });
  it('drops accents and case', () => {
    expect(fold('Débogage Évolution')).toBe('debogage evolution');
    expect(fold('ÉTÉ')).toBe(fold('ete'));
  });
  it('expands ligatures', () => {
    expect(fold('cœur Æther')).toBe('coeur aether');
  });
  it('keeps symbol words and strips code backticks', () => {
    expect(fold('`--`')).toBe('--');
    expect(fold('`$(...)`')).toBe('$(...)');
  });
  it('collapses whitespace', () => {
    expect(fold('  root   cause ')).toBe('root cause');
    expect(terms(' Root  CAUSE ')).toEqual(['root', 'cause']);
  });
});
