// Home page progress summary. The cards and quiz pages own these keys; this reader trusts nothing
// and counts only what it recognises: { [wordId]: { box: 1..5 } } and { [sectionId]: { best, total } }.
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

export interface Progress {
  /** words that have a flashcard state */
  studied: number;
  /** words in the last Leitner box */
  mastered: number;
  /** sections with at least one quiz attempt */
  quizzes: number;
  /** sections whose best quiz score is perfect */
  perfect: number;
}

export function summarize(srs: unknown, quiz: unknown, wordIds: Set<string>, sectionIds: Set<string>): Progress {
  let studied = 0, mastered = 0, quizzes = 0, perfect = 0;
  if (isRecord(srs)) {
    for (const [id, card] of Object.entries(srs)) {
      if (!wordIds.has(id) || !isRecord(card)) continue;
      studied++;
      const box = num(card.box);
      if (box !== null && box >= 5) mastered++;
    }
  }
  if (isRecord(quiz)) {
    for (const [id, q] of Object.entries(quiz)) {
      if (!sectionIds.has(id) || !isRecord(q)) continue;
      quizzes++;
      const best = num(q.best), total = num(q.total);
      if (best !== null && total !== null && total > 0 && best >= total) perfect++;
    }
  }
  return { studied, mastered, quizzes, perfect };
}

/** Same word for everyone on a given local day; the step is coprime with the count, so the walk visits every word. */
export function dayIndex(count: number, now: Date): number {
  if (count <= 0) return -1;
  const day = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
  let step = 7919;
  while (gcd(step, count) !== 1) step++;
  return (((day * step) % count) + count) % count;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
