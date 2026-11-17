/** Horizontal swipe on a flashcard: pure state machine and threshold math, no DOM. */

export type Phase = 'idle' | 'tracking' | 'committing' | 'snapping';
export interface Swipe {
  phase: Phase;
  /** pointer that owns the drag; other pointers are ignored */
  id: number;
  x0: number;
  t0: number;
  dx: number;
}
/** what a release means: a tap (flip), a snap back, or a grade */
export type Outcome = 'tap' | 'snap' | 'right' | 'left';

export const IDLE: Swipe = { phase: 'idle', id: -1, x0: 0, t0: 0, dx: 0 };
/** under this many px the pointer did not really move: it is a tap */
export const TAP_SLOP = 8;
/** a flick needs some travel too, or a twitch at release would grade */
export const FLICK_MIN = 24;
/** px per ms; above it a short throw still counts */
export const FLICK_SPEED = 0.11;
export const MAX_DISTANCE = 120;

export const threshold = (width: number) => Math.min(MAX_DISTANCE, width * 0.4);

/** 0 to 1, how close the drag is to committing; drives the hint labels in the same frame */
export const progress = (dx: number, width: number) => Math.min(1, Math.abs(dx) / threshold(width));

export function down(s: Swipe, id: number, x: number, t: number): Swipe {
  if (s.phase !== 'idle') return s;
  return { phase: 'tracking', id, x0: x, t0: t, dx: 0 };
}

export function move(s: Swipe, id: number, x: number): Swipe {
  if (s.phase !== 'tracking' || s.id !== id) return s;
  return { ...s, dx: x - s.x0 };
}

export function release(s: Swipe, id: number, t: number, width: number): { state: Swipe; outcome: Outcome } | null {
  if (s.phase !== 'tracking' || s.id !== id) return null;
  const dist = Math.abs(s.dx);
  if (dist < TAP_SLOP) return { state: IDLE, outcome: 'tap' };
  const speed = dist / Math.max(1, t - s.t0);
  const commit = dist >= threshold(width) || (dist >= FLICK_MIN && speed > FLICK_SPEED);
  if (!commit) return { state: { ...s, phase: 'snapping' }, outcome: 'snap' };
  return { state: { ...s, phase: 'committing' }, outcome: s.dx > 0 ? 'right' : 'left' };
}

/** pointercancel, Escape, lost capture: always back to the middle, never a grade */
export function cancel(s: Swipe): Swipe {
  return s.phase === 'tracking' ? { ...s, phase: 'snapping' } : s;
}

/** fly-out duration: the card keeps the speed it was thrown at, within 150 to 300 ms */
export function flyMs(dx: number, elapsedMs: number, width: number): number {
  const remaining = Math.max(0, width - Math.abs(dx));
  const speed = Math.abs(dx) / Math.max(1, elapsedMs);
  const ms = speed > 0 ? remaining / speed : 300;
  return Math.round(Math.min(300, Math.max(150, ms)));
}
