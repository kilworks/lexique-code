import type { Lexicon } from './types';

export interface GraphNode { id: string; section: string; x: number; y: number }
export interface Cluster { id: string; x: number; y: number; r: number }
export interface Graph {
  nodes: GraphNode[];
  /** combination links, each pair once, a < b */
  edges: [string, string][];
  clusters: Cluster[];
  width: number;
  height: number;
}

/** Minimum distance between two nodes, in world units: keeps a 24px hit circle per node at zoom 1. */
export const NODE_GAP = 24;
const C = 16; // spiral step: Vogel spiral neighbours sit about 1.8 C apart
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const PAD = 56; // room around each cluster for its title

/** Combination links, each pair once (a < b), between the known ids only. */
function combinationEdges(lex: Lexicon, known: Set<string>): [string, string][] {
  const seen = new Set<string>();
  const edges: [string, string][] = [];
  for (const c of lex.combinations) {
    const ws = [...new Set(c.words.filter((w) => known.has(w)))];
    for (let a = 0; a < ws.length; a++) {
      for (let b = a + 1; b < ws.length; b++) {
        const pair = (ws[a] < ws[b] ? [ws[a], ws[b]] : [ws[b], ws[a]]) as [string, string];
        const key = pair.join('\n');
        if (!seen.has(key)) { seen.add(key); edges.push(pair); }
      }
    }
  }
  return edges;
}

/**
 * Grid cell for each of n items, so that items with many links between them sit close: starts from
 * document order and keeps every pairwise swap that shortens the weighted sum of cell distances.
 * Pure and deterministic. `w[i][j]` is the link count between items i and j.
 */
export function arrangeCells(n: number, cols: number, w: number[][]): number[] {
  const slot = Array.from({ length: n }, (_, i) => i);
  const dist = (a: number, b: number) => Math.hypot((a % cols) - (b % cols), Math.floor(a / cols) - Math.floor(b / cols));
  const costOf = (i: number) => {
    let c = 0;
    for (let j = 0; j < n; j++) if (j !== i && w[i][j]) c += w[i][j] * dist(slot[i], slot[j]);
    return c;
  };
  for (let pass = 0; pass < 50; pass++) {
    let improved = false;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const before = costOf(i) + costOf(j);
        [slot[i], slot[j]] = [slot[j], slot[i]];
        // the i-j link keeps its length under a swap, so comparing the two items' own costs is exact
        if (costOf(i) + costOf(j) < before - 1e-9) improved = true;
        else [slot[i], slot[j]] = [slot[j], slot[i]];
      }
    }
    if (!improved) break;
  }
  return slot;
}

/**
 * Section clusters on a grid, words on a sunflower spiral inside each cluster, edges from combinations.
 * Sections that share many combination links get neighbouring cells (see arrangeCells), so links stay short.
 * Pure and deterministic: same lexicon and column count, same positions. No simulation, so nothing moves after load.
 * `cols` defaults to a square grid; a wide screen asks for more columns. `arrange: false` keeps document order.
 */
export function layoutGraph(lex: Lexicon, cols?: number, arrange = true): Graph {
  const sections = lex.sections.filter((s) => s.kind === 'words' && s.words.some((id) => lex.words[id]));
  const radius = (n: number) => C * Math.sqrt(n) + NODE_GAP / 2;
  const cell = 2 * Math.max(0, ...sections.map((s) => radius(s.words.length))) + PAD;
  cols = Math.max(1, Math.round(cols ?? Math.ceil(Math.sqrt(sections.length))));
  const known = new Set(sections.flatMap((s) => s.words.filter((id) => lex.words[id])));
  const edges = combinationEdges(lex, known);
  const index = new Map(sections.map((s, i) => [s.id, i]));
  const w = sections.map(() => new Array<number>(sections.length).fill(0));
  for (const [a, b] of edges) {
    const i = index.get(lex.words[a].section);
    const j = index.get(lex.words[b].section);
    if (i !== undefined && j !== undefined && i !== j) { w[i][j]++; w[j][i]++; }
  }
  const slot = arrange ? arrangeCells(sections.length, cols, w) : sections.map((_, i) => i);
  const nodes: GraphNode[] = [];
  const clusters: Cluster[] = [];
  sections.forEach((s, i) => {
    const cx = (slot[i] % cols) * cell + cell / 2;
    const cy = Math.floor(slot[i] / cols) * cell + cell / 2 + PAD / 4;
    const ids = s.words.filter((id) => lex.words[id]);
    clusters.push({ id: s.id, x: cx, y: cy, r: radius(ids.length) });
    ids.forEach((id, j) => {
      const r = C * Math.sqrt(j + 0.5);
      nodes.push({ id, section: s.id, x: cx + r * Math.cos(j * GOLDEN), y: cy + r * Math.sin(j * GOLDEN) });
    });
  });
  const rows = Math.ceil(sections.length / cols);
  return { nodes, edges, clusters, width: cols * cell, height: rows * cell + PAD / 2 };
}

/** id -> ids linked to it by a combination. */
export function adjacency(edges: [string, string][]): Map<string, Set<string>> {
  const m = new Map<string, Set<string>>();
  const add = (a: string, b: string) => { if (!m.has(a)) m.set(a, new Set()); m.get(a)!.add(b); };
  for (const [a, b] of edges) { add(a, b); add(b, a); }
  return m;
}

/** The node closest to a point, or null when there are none. */
export function nearestTo(nodes: GraphNode[], x: number, y: number): GraphNode | null {
  let best: GraphNode | null = null;
  let bestD = Infinity;
  for (const n of nodes) {
    const d = (n.x - x) ** 2 + (n.y - y) ** 2;
    if (d < bestD) { bestD = d; best = n; }
  }
  return best;
}

export type Dir = 'up' | 'down' | 'left' | 'right';
const VEC: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/**
 * Next node from `from` in a direction, for arrow-key navigation: only nodes inside the 90 degree cone
 * around the direction count, and a sideways offset costs twice a straight one. Null at the edge.
 */
export function nearestInDirection(nodes: GraphNode[], from: GraphNode, dir: Dir): GraphNode | null {
  const [dx, dy] = VEC[dir];
  let best: GraphNode | null = null;
  let bestScore = Infinity;
  for (const n of nodes) {
    if (n.id === from.id) continue;
    const vx = n.x - from.x;
    const vy = n.y - from.y;
    const along = vx * dx + vy * dy;
    const side = Math.abs(vx * dy - vy * dx);
    if (along <= 0 || side > along) continue;
    const score = along + 2 * side;
    if (score < bestScore) { bestScore = score; best = n; }
  }
  return best;
}
