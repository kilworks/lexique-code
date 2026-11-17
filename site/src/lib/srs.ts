// Leitner flashcards, pure logic. Stored under KEYS.srs ("lexicon.srs.v1") as
//   { [wordId]: { box: 1..5, due: "YYYY-MM-DD" } }
// box: integer 1 to 5. due: local calendar day the card is next due; missing or invalid means due now.
// A word with no entry is new and counts as due. Other pages may write here:
// a quiz mistake is { box: 1, due: <today> } (use markMistakes), never anything else.
// Days are local calendar days counted through Date.UTC, so DST and the clock time never shift them.

export const BOXES = 5;
/** Days until the next review, for boxes 1 to 5. */
export const INTERVALS = [0, 1, 3, 7, 16] as const;

export interface Card { box: number; due: string }
export type SrsState = Record<string, Card>;

const DAY_MS = 86_400_000;
const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local calendar day of a date, as a day count since 1970-01-01. */
export function dayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS);
}

export function dayKey(n: number): string {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export function parseDay(s: unknown): number | null {
  if (typeof s !== 'string') return null;
  const m = DAY_RE.exec(s);
  if (!m) return null;
  const n = Date.UTC(+m[1], +m[2] - 1, +m[3]) / DAY_MS;
  return dayKey(n) === s ? n : null; // rejects 2026-02-31
}

/** Keeps only well formed entries; a bad due becomes '' (due now), a bad box drops the entry. */
export function parseState(raw: unknown): SrsState {
  const out: SrsState = {};
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return out;
  for (const [id, v] of Object.entries(raw)) {
    if (typeof v !== 'object' || v === null) continue;
    const { box, due } = v as Record<string, unknown>;
    if (typeof box !== 'number' || !Number.isInteger(box) || box < 1 || box > BOXES) continue;
    out[id] = { box, due: parseDay(due) === null ? '' : (due as string) };
  }
  return out;
}

export function isDue(card: Card | undefined, today: number): boolean {
  if (!card) return true;
  const d = parseDay(card.due);
  return d === null || d <= today;
}

/**
 * Cards due now from a deck, most urgent first: reviewed cards by due day then box, then new cards in deck order.
 * `limit` caps the session (new cards are cut first).
 */
export function dueCards(deck: readonly string[], state: SrsState, now: Date, limit = Infinity): string[] {
  const today = dayNumber(now);
  const seen = new Set<string>();
  const known: { id: string; due: number; box: number; i: number }[] = [];
  const fresh: string[] = [];
  deck.forEach((id, i) => {
    if (seen.has(id)) return;
    seen.add(id);
    const card = Object.hasOwn(state, id) ? state[id] : undefined;
    if (!card) fresh.push(id);
    else if (isDue(card, today)) known.push({ id, due: parseDay(card.due) ?? -Infinity, box: card.box, i });
  });
  known.sort((a, b) => a.due - b.due || a.box - b.box || a.i - b.i);
  return [...known.map((k) => k.id), ...fresh].slice(0, Math.max(0, limit));
}

/** Earliest future due day of a deck, or null when nothing is scheduled later. */
export function nextDue(deck: readonly string[], state: SrsState, now: Date): string | null {
  const today = dayNumber(now);
  let best: number | null = null;
  for (const id of deck) {
    const d = Object.hasOwn(state, id) ? parseDay(state[id].due) : null;
    if (d !== null && d > today && (best === null || d < best)) best = d;
  }
  return best === null ? null : dayKey(best);
}

/** Known: one box up (box 5 stays), due after its interval. Not yet: back to box 1, due today. */
export function answer(state: SrsState, id: string, knew: boolean, now: Date): SrsState {
  const cur = Object.hasOwn(state, id) ? state[id].box : 1; // a new card starts in box 1
  const box = knew ? Math.min(cur + 1, BOXES) : 1;
  return { ...state, [id]: { box, due: dayKey(dayNumber(now) + INTERVALS[box - 1]) } };
}

/** Quiz mistakes: each word goes to box 1, due today. */
export function markMistakes(state: SrsState, ids: readonly string[], now: Date): SrsState {
  const due = dayKey(dayNumber(now));
  const next = { ...state };
  for (const id of ids) next[id] = { box: 1, due };
  return next;
}
