import { describe, expect, it } from 'vitest';
import { cancel, down, flyMs, IDLE, move, progress, release, threshold, type Swipe } from './swipe';

const W = 400; // card width: threshold is min(120, 160) = 120

/** pointer 1 goes down at x=100, t=0, moves to x=100+dx, lifts at t=ms */
function drag(dx: number, ms: number): ReturnType<typeof release> {
  let s: Swipe = down(IDLE, 1, 100, 0);
  s = move(s, 1, 100 + dx);
  return release(s, 1, ms, W);
}

describe('swipe', () => {
  it('threshold is 40% of the card, capped at 120px', () => {
    expect(threshold(200)).toBe(80);
    expect(threshold(1000)).toBe(120);
  });

  it('a slow long drag commits in its direction', () => {
    expect(drag(150, 3000)?.outcome).toBe('right');
    expect(drag(-150, 3000)?.outcome).toBe('left');
    expect(drag(150, 3000)?.state.phase).toBe('committing');
  });

  it('a fast short flick commits', () => {
    expect(drag(40, 100)?.outcome).toBe('right'); // 0.4 px/ms
    expect(drag(-40, 100)?.outcome).toBe('left');
  });

  it('a slow short drag snaps back', () => {
    const r = drag(40, 2000); // 0.02 px/ms, under threshold
    expect(r?.outcome).toBe('snap');
    expect(r?.state.phase).toBe('snapping');
  });

  it('a quick twitch past the tap slop does not grade', () => {
    expect(drag(12, 10)?.outcome).toBe('snap'); // fast but under FLICK_MIN
  });

  it('a move under the tap slop is a tap', () => {
    expect(drag(5, 50)?.outcome).toBe('tap');
    expect(drag(-7, 50)?.state).toEqual(IDLE);
  });

  it('cancel never grades, it snaps back', () => {
    let s = down(IDLE, 1, 0, 0);
    s = move(s, 1, 300);
    s = cancel(s);
    expect(s.phase).toBe('snapping');
    expect(release(s, 1, 50, W)).toBeNull();
  });

  it('cancel outside a drag changes nothing', () => {
    expect(cancel(IDLE)).toBe(IDLE);
  });

  it('ignores a second pointer while dragging', () => {
    let s = down(IDLE, 1, 100, 0);
    expect(down(s, 2, 500, 10)).toBe(s);
    s = move(s, 1, 130);
    expect(move(s, 2, 900).dx).toBe(30);
    expect(release(s, 2, 50, W)).toBeNull();
  });

  it('progress grows with distance and stops at 1', () => {
    expect(progress(60, W)).toBe(0.5);
    expect(progress(-60, W)).toBe(0.5);
    expect(progress(500, W)).toBe(1);
  });

  it('fly-out duration follows the throw speed, clamped to 150..300ms', () => {
    expect(flyMs(200, 100, W)).toBe(150); // 2 px/ms, 200px left = 100ms, clamped up
    expect(flyMs(150, 3000, W)).toBe(300); // slow drag, clamped down
    expect(flyMs(200, 250, W)).toBe(250); // 0.8 px/ms, 200px left
    expect(flyMs(0, 0, W)).toBe(300);
  });
});
