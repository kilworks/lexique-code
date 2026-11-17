import { describe, expect, it } from 'vitest';
import {
  backoff, backoffSchedule, backpressure, BP, blueGreen, circuitBreaker, CB, eventual, fanOut, histogram,
  firstLost, idemPhases, idempotent, IDEM, BG, jobDurations, mulberry32, race, RACE, staleRead, rateLimit, RL, rnd, run, singleFlight,
} from './sims';

describe('prng', () => {
  it('same seed gives the same sequence, another seed another one', () => {
    const a = mulberry32(42), b = mulberry32(42), c = mulberry32(43);
    const xa = [a(), a(), a(), a()], xb = [b(), b(), b(), b()], xc = [c(), c(), c(), c()];
    expect(xa).toEqual(xb);
    expect(xa).not.toEqual(xc);
    for (const v of xa) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
  it('rnd is pure and matches the stateful form', () => {
    const [v1, s1] = rnd(7);
    expect(rnd(7)).toEqual([v1, s1]);
    const g = mulberry32(7);
    expect(g()).toBe(v1);
    expect(g()).toBe(rnd(s1)[0]);
  });
  it('spreads values over the unit interval', () => {
    const g = mulberry32(1);
    const xs = Array.from({ length: 2000 }, g);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(mean).toBeGreaterThan(0.45);
    expect(mean).toBeLessThan(0.55);
  });
});

describe('run', () => {
  it('clamps n to [0, max] and replays deterministically', () => {
    const p = { rate: 4 };
    expect(run(backpressure, p, false, 1, -3).n).toBe(0);
    expect(run(backpressure, p, false, 1, 999).n).toBe(backpressure.max(p, false, 1));
    expect(run(circuitBreaker, { failRate: 50 }, true, 9, 12)).toEqual(run(circuitBreaker, { failRate: 50 }, true, 9, 12));
  });
});

describe('backpressure', () => {
  it('without the practice a fast producer grows the queue until it crashes', () => {
    const s = run(backpressure, { rate: 4 }, false, 1, 14);
    expect(s.crashed).toBe(true);
    expect(s.queue.length).toBeGreaterThan(BP.mem);
  });
  it('with a bounded queue the producer is held and the queue never passes the cap', () => {
    for (let n = 0; n <= 14; n++) {
      const s = run(backpressure, { rate: 5 }, true, 1, n);
      expect(s.queue.length).toBeLessThanOrEqual(BP.cap);
      expect(s.crashed).toBe(false);
    }
    const end = run(backpressure, { rate: 5 }, true, 1, 14);
    expect(end.held).toBeGreaterThan(0);
    expect(end.consumed + end.queue.length).toBe(end.next);
  });
  it('a slow producer stays steady in both modes', () => {
    expect(run(backpressure, { rate: 2 }, false, 1, 14).crashed).toBe(false);
    expect(run(backpressure, { rate: 2 }, true, 1, 14).held).toBe(0);
  });
});

describe('circuit breaker', () => {
  it('opens after the threshold of consecutive failures and fails fast while open', () => {
    const s3 = run(circuitBreaker, { failRate: 100 }, true, 1, CB.threshold);
    expect(s3.breaker).toBe('open');
    expect(s3.ev).toBe('trip');
    const s4 = run(circuitBreaker, { failRate: 100 }, true, 1, CB.threshold + 1);
    expect(s4.last).toBe('fast');
    expect(s4.timeouts).toBe(CB.threshold);
  });
  it('goes half-open after the cooldown, then reopens on a failed trial', () => {
    const half = run(circuitBreaker, { failRate: 100 }, true, 1, CB.threshold + CB.cooldown);
    expect(half.breaker).toBe('half');
    expect(run(circuitBreaker, { failRate: 100 }, true, 1, CB.threshold + CB.cooldown + 1).ev).toBe('reopen');
  });
  it('closes again when the trial call succeeds', () => {
    const half = run(circuitBreaker, { failRate: 100 }, true, 1, CB.threshold + CB.cooldown);
    expect(circuitBreaker.step(half, { failRate: 0 }, true).ev).toBe('close');
  });
  it('without a breaker every failing call is a slow timeout', () => {
    const s = run(circuitBreaker, { failRate: 100 }, false, 1, 20);
    expect(s.timeouts).toBe(20);
    expect(s.fast).toBe(0);
    expect(s.breaker).toBe('closed');
  });
  it('with a healthy service nothing trips', () => {
    expect(run(circuitBreaker, { failRate: 0 }, true, 1, 20)).toMatchObject({ ok: 20, breaker: 'closed' });
  });
});

describe('backoff + jitter', () => {
  it('without jitter every client retries at the same instants', () => {
    const pts = backoffSchedule(10, 4, false, 1);
    expect(new Set(pts.map((a) => a.t))).toEqual(new Set([1, 3, 7, 15]));
  });
  it('full jitter keeps each wait within its cap and is seeded', () => {
    const pts = backoffSchedule(20, 4, true, 5);
    expect(pts).toEqual(backoffSchedule(20, 4, true, 5));
    for (const a of pts.filter((x) => x.k === 1)) { expect(a.t).toBeGreaterThanOrEqual(0); expect(a.t).toBeLessThanOrEqual(1); }
  });
  it('histogram drops out-of-range times', () => {
    expect(histogram([0, 0.4, 0.6, 99, -1], 0.5, 2)).toEqual([2, 1, 0, 0]);
    expect(histogram([], 1, 3)).toEqual([0, 0, 0]);
  });
  it('jitter cuts the peak load', () => {
    const plain = run(backoff, { clients: 30 }, false, 3, 4);
    const jit = run(backoff, { clients: 30 }, true, 3, 4);
    expect(plain.peak).toBe(30);
    expect(jit.peak).toBeLessThan(plain.peak * 0.6);
  });
});

describe('race condition', () => {
  const total = (t: number) => t * RACE.incs;
  it('without a lock some seeds lose updates, and lost equals expected minus final', () => {
    let seen = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const p = { threads: 4 };
      const s = run(race, p, false, seed, race.max(p, false, seed));
      expect(s.counter).toBe(total(4) - s.lost);
      if (s.lost > 0) seen++;
    }
    expect(seen).toBeGreaterThan(0);
  });
  it('with a lock no update is ever lost', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const p = { threads: 6 };
      const s = run(race, p, true, seed, race.max(p, true, seed));
      expect(s.lost).toBe(0);
      expect(s.counter).toBe(total(6));
    }
  });
  it('firstLost lands on the first lost write, and on 0 when a run loses nothing', () => {
    let found = 0;
    for (let seed = 1; seed <= 20; seed++) {
      const p = { threads: 4 };
      const n = firstLost(p, false, seed);
      const s = run(race, p, false, seed, n);
      if (n === 0) { expect(run(race, p, false, seed, race.max(p, false, seed)).lost).toBe(0); continue; }
      found++;
      expect(s.log[n - 1].lost).toBe(true);
      expect(s.log.slice(0, n - 1).some((o) => o.lost)).toBe(false);
      expect(s.lost).toBeGreaterThan(0);
    }
    expect(found).toBeGreaterThan(0);
    expect(firstLost({ threads: 4 }, true, 3)).toBe(0);
  });
  it('staleRead finds the read the lost write was computed from', () => {
    const p = { threads: 4 };
    const s = run(race, p, false, 1, race.max(p, false, 1));
    s.log.forEach((o, i) => {
      if (o.op !== 'w') return;
      const j = staleRead(s.log, i);
      expect(s.log[j].t).toBe(o.t);
      expect(s.log[j].op).toBe('r');
      expect(o.v).toBe(s.log[j].v + 1);
    });
  });
  it('a read is always followed by a write of the same thread when locked', () => {
    const s = run(race, { threads: 3 }, true, 11, 18);
    for (let i = 0; i < s.log.length; i += 2) {
      expect(s.log[i].op).toBe('r');
      expect(s.log[i + 1].t).toBe(s.log[i].t);
    }
  });
});

describe('idempotent', () => {
  it('builds the phase script', () => {
    expect(idemPhases(1, false)).toEqual(['start', 'send', 'apply', 'lost', 'resend', 'charge', 'reply']);
    expect(idemPhases(2, true).filter((x) => x === 'dedupe')).toHaveLength(2);
  });
  it('retries charge again without a key, once with it', () => {
    const p = { retries: 2 };
    expect(run(idempotent, p, false, 1, 99).charged).toBe(3 * IDEM.amount);
    const fixed = run(idempotent, p, true, 1, 99);
    expect(fixed.charged).toBe(IDEM.amount);
    expect(fixed.sent).toBe(3);
    expect(fixed.phase).toBe('reply');
  });
});

describe('blue-green', () => {
  const end = (fix: boolean, bug: number) => run(blueGreen, { bug }, fix, 1, 99);
  it('in-place deploy drops requests while stopped, more with a bad version', () => {
    expect(end(false, 0).failed).toBe(2 * BG.perStep);
    expect(end(false, 1)).toMatchObject({ failed: 4 * BG.perStep, ev: 'rolled' });
  });
  it('blue-green never drops a request, good or bad version', () => {
    expect(end(true, 0)).toMatchObject({ failed: 0, ev: 'standby' });
    expect(end(true, 1)).toMatchObject({ failed: 0, ev: 'kept' });
  });
});

describe('fan-out / fan-in', () => {
  it('durations are seeded and in 1..3', () => {
    const d = jobDurations(8, 4);
    expect(d).toEqual(jobDurations(8, 4));
    expect(d.every((x) => x >= 1 && x <= 3)).toBe(true);
  });
  it('one worker takes the sum of durations, more workers finish sooner with every job merged', () => {
    const seed = 4;
    const sum = jobDurations(8, seed).reduce((a, b) => a + b, 0);
    const seq = fanOut.max({ workers: 4 }, false, seed);
    const par = fanOut.max({ workers: 4 }, true, seed);
    expect(seq).toBe(sum + 1); // first step only hands the job out
    expect(par).toBeLessThan(seq);
    const s = run(fanOut, { workers: 4 }, true, seed, par);
    expect(s.ev).toBe('merged');
    expect([...s.done].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
});

describe('eventual consistency', () => {
  it('reads from followers right after a write are stale', () => {
    const s = run(eventual, { delay: 4 }, false, 1, 14);
    expect(s.stale).toBeGreaterThan(0);
  });
  it('read-your-writes never returns a stale value', () => {
    for (let d = 1; d <= 5; d++) expect(run(eventual, { delay: d }, true, 1, 14).stale).toBe(0);
  });
  it('replicas converge once the messages arrive', () => {
    const s = run(eventual, { delay: 2 }, false, 1, 14);
    expect(s.vals).toEqual([2, 2, 2]);
    expect(s.msgs).toHaveLength(0);
  });
});

describe('rate limit', () => {
  it('without a limiter a burst over capacity errors everyone', () => {
    const s = run(rateLimit, { rate: RL.capacity + 2 }, false, 1, 5);
    expect(s.errors).toBe(5 * (RL.capacity + 2));
    expect(s.served).toBe(0);
  });
  it('the token bucket keeps the server under capacity and rejects the excess', () => {
    const s = run(rateLimit, { rate: 9 }, true, 1, 12);
    expect(s.errors).toBe(0);
    expect(s.hist.every((t) => t.served <= RL.capacity)).toBe(true);
    expect(s.served + s.rejected).toBe(9 * 12);
  });
  it('the bucket never holds more than its size', () => {
    for (let n = 0; n <= 12; n++) expect(run(rateLimit, { rate: 1 }, true, 1, n).tokens).toBeLessThanOrEqual(RL.bucket);
  });
});

describe('single-flight', () => {
  it('N callers make N database calls without it and 1 with it', () => {
    expect(run(singleFlight, { callers: 7 }, false, 1, 9).dbCalls).toBe(7);
    const s = run(singleFlight, { callers: 7 }, true, 1, 3);
    expect(s).toMatchObject({ dbCalls: 1, waiting: 6 });
    expect(run(singleFlight, { callers: 7 }, true, 1, 9).waiting).toBe(0);
  });
});
