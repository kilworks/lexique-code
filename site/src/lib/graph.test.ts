import { describe, expect, it } from 'vitest';
import data from '../data/lexicon.json';
import { adjacency, arrangeCells, layoutGraph, nearestInDirection, nearestTo, NODE_GAP, type GraphNode } from './graph';
import type { Lexicon, Word } from './types';

const real = data as Lexicon;

const w = (id: string, section: string): Word => ({
  id, section,
  en: { word: id, meaning: 'm', action: 'a' },
  fr: { word: id, meaning: 'm', action: 'a' },
  aliases: { en: [id], fr: [id] },
});

const small: Lexicon = {
  sections: [
    { id: 's1', title: { en: 'S1', fr: 'S1' }, kind: 'words', words: ['a', 'b', 'c'] },
    { id: 's2', title: { en: 'S2', fr: 'S2' }, kind: 'words', words: ['d'] },
    { id: 'empty', title: { en: 'E', fr: 'E' }, kind: 'words', words: [] },
    { id: 'combinations', title: { en: 'C', fr: 'C' }, kind: 'combinations', words: [] },
  ],
  words: { a: w('a', 's1'), b: w('b', 's1'), c: w('c', 's1'), d: w('d', 's2') },
  combinations: [
    { id: 'x', en: { phrase: '', result: '' }, fr: { phrase: '', result: '' }, words: ['c', 'a', 'unresolved term', 'a'] },
    { id: 'y', en: { phrase: '', result: '' }, fr: { phrase: '', result: '' }, words: ['a', 'c', 'd'] },
  ],
};

describe('layoutGraph', () => {
  it('places every word of the real lexicon once, with finite coordinates inside the bounds', () => {
    const g = layoutGraph(real);
    const ids = g.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(ids)).toEqual(new Set(Object.keys(real.words)));
    for (const n of g.nodes) {
      expect(Number.isFinite(n.x) && Number.isFinite(n.y)).toBe(true);
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
      expect(n.x).toBeLessThanOrEqual(g.width);
      expect(n.y).toBeLessThanOrEqual(g.height);
      expect(real.words[n.id].section).toBe(n.section);
    }
    expect(g.clusters).toHaveLength(real.sections.filter((s) => s.kind === 'words').length);
  });

  it('honours the column count and keeps its invariants', () => {
    const wide = layoutGraph(real, 7);
    expect(new Set(wide.clusters.map((c) => c.x)).size).toBe(7);
    expect(wide.width / wide.height).toBeGreaterThan(layoutGraph(real, 4).width / layoutGraph(real, 4).height);
    expect(new Set(wide.nodes.map((n) => n.id))).toEqual(new Set(Object.keys(real.words)));
    for (const n of wide.nodes) expect(n.x <= wide.width && n.y <= wide.height).toBe(true);
    expect(layoutGraph(real, 0).clusters.every((c) => c.x === layoutGraph(real, 0).clusters[0].x)).toBe(true);
  });

  it('is deterministic', () => {
    expect(layoutGraph(real)).toEqual(layoutGraph(real));
  });

  it('keeps nodes at least NODE_GAP apart so each one keeps its hit circle', () => {
    const { nodes } = layoutGraph(real);
    let min = Infinity;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        min = Math.min(min, Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y));
      }
    }
    expect(min).toBeGreaterThanOrEqual(NODE_GAP);
  });

  it('keeps each word inside its own cluster circle', () => {
    const g = layoutGraph(real);
    const byId = new Map(g.clusters.map((c) => [c.id, c]));
    for (const n of g.nodes) {
      const c = byId.get(n.section)!;
      expect(Math.hypot(n.x - c.x, n.y - c.y)).toBeLessThanOrEqual(c.r);
    }
  });

  it('builds edges from combinations: known ids only, each pair once, ordered', () => {
    const g = layoutGraph(small);
    expect(g.edges).toEqual([['a', 'c'], ['a', 'd'], ['c', 'd']]);
    const real_ = layoutGraph(real);
    const known = new Set(Object.keys(real.words));
    expect(real_.edges.length).toBeGreaterThan(20);
    for (const [a, b] of real_.edges) {
      expect(known.has(a) && known.has(b)).toBe(true);
      expect(a < b).toBe(true);
    }
    expect(new Set(real_.edges.map((e) => e.join('|'))).size).toBe(real_.edges.length);
  });

  it('skips empty sections and handles an empty lexicon', () => {
    expect(layoutGraph(small).clusters.map((c) => c.id)).toEqual(['s1', 's2']);
    const g = layoutGraph({ sections: [], words: {}, combinations: [] });
    expect(g.nodes).toEqual([]);
    expect(g.edges).toEqual([]);
    expect(Number.isFinite(g.width) && Number.isFinite(g.height)).toBe(true);
  });
});

describe('cluster arrangement', () => {
  const total = (g: ReturnType<typeof layoutGraph>) => {
    const at = new Map(g.nodes.map((n) => [n.id, n]));
    return g.edges.reduce((sum, [a, b]) => sum + Math.hypot(at.get(a)!.x - at.get(b)!.x, at.get(a)!.y - at.get(b)!.y), 0);
  };
  it('shortens the total combination link length against document order, at both column counts', () => {
    for (const cols of [4, 7]) {
      const plain = total(layoutGraph(real, cols, false));
      const arranged = total(layoutGraph(real, cols));
      expect(arranged).toBeLessThan(plain * 0.85);
    }
  });
  it('is a permutation of the cells, and puts two linked items side by side', () => {
    const w = [[0, 0, 0, 5], [0, 0, 0, 0], [0, 0, 0, 0], [5, 0, 0, 0]];
    const slot = arrangeCells(4, 4, w);
    expect([...slot].sort()).toEqual([0, 1, 2, 3]);
    expect(Math.abs(slot[0] - slot[3])).toBe(1);
    expect(arrangeCells(0, 3, [])).toEqual([]);
  });
});

describe('adjacency', () => {
  it('links both ends of every edge', () => {
    const m = adjacency([['a', 'c'], ['a', 'd']]);
    expect([...m.get('a')!].sort()).toEqual(['c', 'd']);
    expect([...m.get('c')!]).toEqual(['a']);
    expect(m.has('b')).toBe(false);
  });
});

const n = (id: string, x: number, y: number): GraphNode => ({ id, section: 's', x, y });

describe('nearestTo', () => {
  it('returns the closest node, null when empty', () => {
    expect(nearestTo([n('a', 0, 0), n('b', 10, 10)], 8, 9)?.id).toBe('b');
    expect(nearestTo([], 0, 0)).toBeNull();
  });
});

describe('nearestInDirection', () => {
  const nodes = [n('o', 0, 0), n('r', 50, 5), n('far', 100, 0), n('diag', 30, 40), n('u', 0, -60), n('l', -20, 0)];
  const from = nodes[0];
  it('picks the nearest node inside the cone of the direction', () => {
    expect(nearestInDirection(nodes, from, 'right')?.id).toBe('r');
    expect(nearestInDirection(nodes, from, 'up')?.id).toBe('u');
    expect(nearestInDirection(nodes, from, 'left')?.id).toBe('l');
    expect(nearestInDirection(nodes, from, 'down')?.id).toBe('diag');
  });
  it('returns null at the edge of the map', () => {
    expect(nearestInDirection([from, n('l', -20, 0)], from, 'right')).toBeNull();
    expect(nearestInDirection([from], from, 'up')).toBeNull();
    // steeper than 45 degrees: belongs to "down", not to "right"
    expect(nearestInDirection([from, n('steep', 10, 15)], from, 'right')).toBeNull();
  });
});
