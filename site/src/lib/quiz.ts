// Quiz generator for one lesson: pure and seeded, so one seed always gives the same quiz.
// Options are word ids; the page renders the asked field in the current language.
import { fold } from './normalize';
import type { Lexicon, Row } from './types';

export type Field = keyof Row;
export type QuestionKind = 'word-for-action' | 'meaning-of-word' | 'action-for-word' | 'complete-combination';

export interface Question {
  kind: QuestionKind;
  /** the right answer (a word id) */
  answer: string;
  /** field of the answer word shown as the prompt (unused for combinations) */
  prompt: Field;
  /** field shown for each option */
  show: Field;
  /** 4 distinct word ids, answer included */
  options: string[];
  /** for complete-combination: the combination and the position of the blank in its words */
  combo?: { id: string; blank: number };
}

export const QUIZ_LENGTH = 10;
const OPTIONS = 4;

const KINDS: { kind: QuestionKind; prompt: Field; show: Field }[] = [
  { kind: 'word-for-action', prompt: 'action', show: 'word' },
  { kind: 'meaning-of-word', prompt: 'word', show: 'meaning' },
  { kind: 'action-for-word', prompt: 'word', show: 'action' },
];

/** mulberry32: small, fast, good enough to shuffle a quiz. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Combinations with at least one term resolved to a word of the section. */
export function sectionCombos(lex: Lexicon, sectionId: string) {
  return lex.combinations.filter((c) => c.words.some((w) => lex.words[w]?.section === sectionId));
}

/**
 * Up to `length` questions on one word section (fewer when the section has fewer words, since no
 * word is the right answer twice). Distractors come from the same section, borrowed from the other
 * sections only when it is too small. Returns [] for an unknown or empty section.
 */
export function makeQuiz(lex: Lexicon, sectionId: string, seed: number, length = QUIZ_LENGTH, only?: readonly string[]): Question[] {
  const section = lex.sections.find((s) => s.id === sectionId && s.kind === 'words');
  if (!section) return [];
  const own = section.words.filter((w) => Object.hasOwn(lex.words, w));
  // `only` (a lesson step): answers come from these words, distractors still from the whole section
  const answers = only ? own.filter((w) => only.includes(w)) : own;
  const rand = rng(seed);
  const others = shuffle(
    lex.sections.filter((s) => s.kind === 'words' && s.id !== sectionId).flatMap((s) => s.words).filter((w) => Object.hasOwn(lex.words, w)),
    rand,
  );
  const key = (id: string, f: Field) => [fold(lex.words[id].en[f]), fold(lex.words[id].fr[f])];

  // answer first, then distractors whose shown text differs (in both languages) from every pick
  const pickOptions = (answer: string, show: Field, exclude: Set<string>): string[] | null => {
    const picked = [answer];
    const seen = new Set(key(answer, show));
    for (const id of [...shuffle(own, rand), ...others]) {
      if (picked.length === OPTIONS) break;
      if (id === answer || exclude.has(id)) continue;
      const k = key(id, show);
      if (k.some((x) => seen.has(x))) continue;
      k.forEach((x) => seen.add(x));
      picked.push(id);
    }
    return picked.length === OPTIONS ? shuffle(picked, rand) : null;
  };

  const used = new Set<string>();
  const out: Question[] = [];

  // complete the combination: only when 2+ combinations involve the section, at most 2 questions
  const combos = sectionCombos(lex, sectionId);
  if (combos.length >= 2 && !only) {
    for (const c of shuffle(combos, rand)) {
      if (out.length >= Math.min(2, length)) break;
      const blanks = c.words.map((w, i) => [w, i] as const).filter(([w]) => lex.words[w]?.section === sectionId && !used.has(w));
      if (!blanks.length) continue;
      const [answer, blank] = blanks[Math.floor(rand() * blanks.length)];
      // no distractor that forms a combination with a given term: it would be a second right answer
      const given = c.words.filter((_, i) => i !== blank);
      const exclude = new Set(lex.combinations.filter((o) => o.words.some((w) => given.includes(w))).flatMap((o) => o.words));
      exclude.delete(answer);
      const options = pickOptions(answer, 'word', exclude);
      if (!options) continue;
      used.add(answer);
      out.push({ kind: 'complete-combination', answer, prompt: 'word', show: 'word', options, combo: { id: c.id, blank } });
    }
  }

  for (const answer of shuffle(answers, rand)) {
    if (out.length >= length) break;
    if (used.has(answer)) continue;
    const k = KINDS[Math.floor(rand() * KINDS.length)];
    // a step check: the other step words stay out of the options, so one question never hands out another's answer
    const options = pickOptions(answer, k.show, only ? new Set(answers) : new Set());
    if (!options) continue;
    used.add(answer);
    out.push({ kind: k.kind, answer, prompt: k.prompt, show: k.show, options });
  }
  return shuffle(out, rand);
}

/** Word ids answered wrong. answers[i] is the chosen option for question i. */
export function mistakes(questions: Question[], answers: (string | null)[]): string[] {
  return questions.filter((q, i) => answers[i] !== q.answer).map((q) => q.answer);
}

/** First lesson of the path whose quiz was never taken, null when all were. */
export function nextLesson<S extends { id: string; kind: string }>(sections: readonly S[], stored: unknown): S | null {
  return pathOrder(sections).find((s) => !bestOf(stored, s.id)) ?? null;
}

/** Recommended path: these sections first, then the others in lexicon order. */
export const PATH_FIRST = ['method', 'robustness', 'verification', 'security', 'operations'];

export function pathOrder<S extends { id: string; kind: string }>(sections: readonly S[]): S[] {
  const words = sections.filter((s) => s.kind === 'words');
  const rank = (s: S) => {
    const i = PATH_FIRST.indexOf(s.id);
    return i < 0 ? PATH_FIRST.length : i;
  };
  return words.map((s, i) => [s, i] as const).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([s]) => s);
}

/** Lesson steps of about `size` words, balanced so the last one is not a stub. */
export function chunk<T>(items: readonly T[], size = 6): T[][] {
  if (!items.length) return [];
  const n = Math.ceil(items.length / size);
  const base = Math.floor(items.length / n), extra = items.length % n;
  const out: T[][] = [];
  for (let i = 0, at = 0; i < n; i++) {
    const len = base + (i < extra ? 1 : 0);
    out.push(items.slice(at, at + len));
    at += len;
  }
  return out;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export interface Best { best: number; total: number }

/** Best score of a section from the stored lexicon.quiz.v1 value, null when absent or malformed. */
export function bestOf(stored: unknown, sectionId: string): Best | null {
  if (!isRecord(stored) || !Object.hasOwn(stored, sectionId)) return null;
  const q = stored[sectionId];
  if (!isRecord(q) || typeof q.best !== 'number' || typeof q.total !== 'number' || !(q.total > 0)) return null;
  return { best: q.best, total: q.total };
}

/** New lexicon.quiz.v1 value: keeps the best ratio per section, drops what it cannot read. */
export function recordScore(stored: unknown, sectionId: string, score: number, total: number): Record<string, unknown> {
  const next = isRecord(stored) ? { ...stored } : {};
  const prev = bestOf(stored, sectionId);
  if (!prev || score / total >= prev.best / prev.total) next[sectionId] = { best: score, total };
  return next;
}

/** Local calendar day as YYYY-MM-DD. */
export function today(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** New lexicon.srs.v1 value: each missed word goes back to box 1, due today; other fields of a card are kept. */
export function markMistakes(stored: unknown, wordIds: string[], due: string): Record<string, unknown> {
  const next = isRecord(stored) ? { ...stored } : {};
  for (const id of wordIds) {
    const card = next[id];
    next[id] = { ...(isRecord(card) ? card : {}), box: 1, due };
  }
  return next;
}
