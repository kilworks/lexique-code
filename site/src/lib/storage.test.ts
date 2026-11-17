import { afterEach, describe, expect, it, vi } from 'vitest';
import { isLang, isStringArray, read, write } from './storage';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() { return m.size; },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('storage', () => {
  it('falls back when there is no localStorage at all (node)', () => {
    expect(read('x', 42)).toBe(42);
    expect(write('x', 1)).toBe(false);
  });
  it('round-trips JSON values', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    expect(write('cards', ['a', 'b'])).toBe(true);
    expect(read('cards', [] as string[], isStringArray)).toEqual(['a', 'b']);
    expect(read('missing', 'def')).toBe('def');
  });
  it('survives a storage that throws on every call', () => {
    const boom = () => { throw new Error('SecurityError'); };
    vi.stubGlobal('localStorage', { getItem: boom, setItem: boom, removeItem: boom, clear: boom, key: boom, length: 0 });
    expect(read('lang', 'en')).toBe('en');
    expect(write('lang', 'fr')).toBe(false);
  });
  it('rejects corrupt JSON and values that fail the guard', () => {
    const s = memoryStorage();
    vi.stubGlobal('localStorage', s);
    s.setItem('lang', '{not json');
    expect(read('lang', 'en', isLang)).toBe('en');
    s.setItem('lang', '"de"');
    expect(read('lang', 'en', isLang)).toBe('en');
    s.setItem('cards', '[1,2]');
    expect(read('cards', ['x'], isStringArray)).toEqual(['x']);
  });
});
