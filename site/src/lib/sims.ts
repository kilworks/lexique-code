// Pure state machines behind the word-page diagrams. Each sim is replayed from its
// initial state (run), so Step back, Reset and slider changes are all "recompute n steps".
// `fix` is the "with the practice" toggle. Randomness is a pure seeded PRNG carried in the state.

/** mulberry32 as a pure step: returns [value in [0, 1), next state]. */
export function rnd(s: number): [number, number] {
  const n = (s + 0x6d2b79f5) | 0;
  let t = Math.imul(n ^ (n >>> 15), n | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return [((t ^ (t >>> 14)) >>> 0) / 4294967296, n];
}

/** Stateful convenience over rnd, for code that draws many numbers at once. */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    const [v, n] = rnd(s);
    s = n;
    return v;
  };
}

export type Params = Record<string, number>;

export interface Sim<S> {
  max(p: Params, fix: boolean, seed: number): number;
  init(p: Params, fix: boolean, seed: number): S;
  step(s: S, p: Params, fix: boolean): S;
}

/** State after n steps (n is clamped to [0, max]). */
export function run<S>(sim: Sim<S>, p: Params, fix: boolean, seed: number, n: number): S {
  let s = sim.init(p, fix, seed);
  const m = Math.min(Math.max(0, Math.floor(n)), sim.max(p, fix, seed));
  for (let i = 0; i < m; i++) s = sim.step(s, p, fix);
  return s;
}

/* ---------- backpressure: producer faster than consumer ---------- */

export const BP = { consume: 2, cap: 6, mem: 12 };
export interface BpState { n: number; queue: number[]; next: number; consumed: number; held: number; crashed: boolean; ev: 'start' | 'steady' | 'grow' | 'held' | 'crash' | 'down' }

export const backpressure: Sim<BpState> = {
  max: () => 14,
  init: () => ({ n: 0, queue: [], next: 0, consumed: 0, held: 0, crashed: false, ev: 'start' }),
  step(s, p, fix) {
    if (s.crashed) return { ...s, n: s.n + 1, ev: 'down' };
    const k = Math.min(BP.consume, s.queue.length);
    const queue = s.queue.slice(k);
    const want = p.rate;
    const add = fix ? Math.min(want, BP.cap - queue.length) : want;
    for (let i = 0; i < add; i++) queue.push(s.next + i);
    const crashed = !fix && queue.length > BP.mem;
    const ev = crashed ? 'crash' : add < want ? 'held' : queue.length > s.queue.length ? 'grow' : 'steady';
    return { n: s.n + 1, queue, next: s.next + add, consumed: s.consumed + k, held: s.held + want - add, crashed, ev };
  },
};

/* ---------- circuit breaker ---------- */

export const CB = { threshold: 3, cooldown: 3 };
export type Breaker = 'closed' | 'open' | 'half';
export interface CbState {
  n: number; r: number; breaker: Breaker; fails: number; wait: number;
  ok: number; timeouts: number; fast: number;
  last: 'none' | 'ok' | 'timeout' | 'fast';
  ev: 'start' | 'ok' | 'fail' | 'trip' | 'fast' | 'half' | 'close' | 'reopen';
}

export const circuitBreaker: Sim<CbState> = {
  max: () => 20,
  init: (_p, _f, seed) => ({ n: 0, r: seed, breaker: 'closed', fails: 0, wait: 0, ok: 0, timeouts: 0, fast: 0, last: 'none', ev: 'start' }),
  step(s, p, fix) {
    const n = s.n + 1;
    if (fix && s.breaker === 'open') {
      const wait = s.wait - 1;
      return { ...s, n, wait, fast: s.fast + 1, last: 'fast', breaker: wait === 0 ? 'half' : 'open', ev: wait === 0 ? 'half' : 'fast' };
    }
    const [v, r] = rnd(s.r);
    if (v * 100 < p.failRate) {
      const base = { ...s, n, r, timeouts: s.timeouts + 1, last: 'timeout' as const };
      if (!fix) return { ...base, ev: 'fail' };
      if (s.breaker === 'half') return { ...base, breaker: 'open', wait: CB.cooldown, fails: 0, ev: 'reopen' };
      const fails = s.fails + 1;
      if (fails >= CB.threshold) return { ...base, breaker: 'open', wait: CB.cooldown, fails: 0, ev: 'trip' };
      return { ...base, fails, ev: 'fail' };
    }
    return { ...s, n, r, ok: s.ok + 1, fails: 0, last: 'ok', breaker: 'closed', ev: s.breaker === 'half' ? 'close' : 'ok' };
  },
};

/* ---------- backoff + jitter ---------- */

export const BO = { rounds: 4, base: 1, bucket: 0.25, horizon: 16 };
export interface Attempt { c: number; k: number; t: number }
export interface BoState { n: number; points: Attempt[]; peak: number; ev: 'start' | 'round' }

/** Retry k waits base * 2^(k-1); with full jitter it waits a random time in [0, that]. */
export function backoffSchedule(clients: number, rounds: number, jitter: boolean, seed: number): Attempt[] {
  const rand = mulberry32(seed);
  const out: Attempt[] = [];
  for (let c = 0; c < clients; c++) {
    let t = 0;
    for (let k = 1; k <= rounds; k++) {
      const cap = BO.base * 2 ** (k - 1);
      t += jitter ? rand() * cap : cap;
      out.push({ c, k, t });
    }
  }
  return out;
}

/** Counts per time bucket over [0, horizon). */
export function histogram(times: number[], bucket: number, horizon: number): number[] {
  const h = new Array<number>(Math.ceil(horizon / bucket)).fill(0);
  for (const t of times) {
    const i = Math.floor(t / bucket);
    if (i >= 0 && i < h.length) h[i]++;
  }
  return h;
}

export const backoff: Sim<BoState> = {
  max: () => BO.rounds,
  init: (p, fix, seed) => ({ n: 0, points: backoffSchedule(p.clients, BO.rounds, fix, seed), peak: 0, ev: 'start' }),
  step(s) {
    const n = s.n + 1;
    const peak = Math.max(0, ...histogram(s.points.filter((a) => a.k <= n).map((a) => a.t), BO.bucket, BO.horizon));
    return { ...s, n, peak, ev: 'round' };
  },
};

/* ---------- race condition: threads doing read then write on a shared counter ---------- */

export const RACE = { incs: 3 };
export interface RaceOp { t: number; op: 'r' | 'w'; v: number; lost: boolean }
export interface RaceState { n: number; r: number; counter: number; pc: number[]; local: number[]; lock: number; log: RaceOp[]; lost: number; ev: 'start' | 'read' | 'write' | 'lost' }

export const race: Sim<RaceState> = {
  max: (p) => p.threads * RACE.incs * 2,
  init: (p, _f, seed) => ({ n: 0, r: seed, counter: 0, pc: new Array(p.threads).fill(0), local: new Array(p.threads).fill(0), lock: -1, log: [], lost: 0, ev: 'start' }),
  step(s, _p, fix) {
    const end = RACE.incs * 2;
    // with the lock, only its holder may run while it is held
    const runnable = s.pc.map((_, i) => i).filter((i) => s.pc[i] < end && (!fix || s.lock === -1 || s.lock === i));
    if (runnable.length === 0) return s;
    const [v, r] = rnd(s.r);
    const t = runnable[Math.floor(v * runnable.length)];
    const pc = s.pc.slice();
    const local = s.local.slice();
    pc[t]++;
    if (s.pc[t] % 2 === 0) {
      local[t] = s.counter;
      return { ...s, n: s.n + 1, r, pc, local, lock: fix ? t : s.lock, log: [...s.log, { t, op: 'r', v: s.counter, lost: false }], ev: 'read' };
    }
    const lost = s.counter !== local[t];
    const counter = local[t] + 1;
    // this write overwrites every increment made since its read: final = expected - sum of those
    return { ...s, n: s.n + 1, r, pc, local, counter, lock: fix ? -1 : s.lock, lost: s.lost + s.counter - local[t], log: [...s.log, { t, op: 'w', v: counter, lost }], ev: lost ? 'lost' : 'write' };
  },
};

/** Steps up to and including the first lost update of a run (0 when nothing is lost): where the race first shows. */
export function firstLost(p: Params, fix: boolean, seed: number): number {
  const s = run(race, p, fix, seed, race.max(p, fix, seed));
  const i = s.log.findIndex((o) => o.lost);
  return i + 1;
}

/** Index of the read whose stale value the write at log index i used (the same thread's last read before it). */
export function staleRead(log: RaceOp[], i: number): number {
  for (let j = i - 1; j >= 0; j--) if (log[j].t === log[i].t && log[j].op === 'r') return j;
  return -1;
}

/* ---------- idempotent: a retried payment ---------- */

export type IdemPhase = 'start' | 'send' | 'apply' | 'lost' | 'resend' | 'charge' | 'dedupe' | 'reply';
export function idemPhases(retries: number, fix: boolean): IdemPhase[] {
  const out: IdemPhase[] = ['start', 'send', 'apply', 'lost'];
  for (let i = 0; i < retries; i++) out.push('resend', fix ? 'dedupe' : 'charge');
  out.push('reply');
  return out;
}
export interface IdemState { n: number; phase: IdemPhase; charged: number; sent: number; ev: IdemPhase }
export const IDEM = { amount: 10 };

export const idempotent: Sim<IdemState> = {
  max: (p, fix) => idemPhases(p.retries, fix).length - 1,
  init: () => ({ n: 0, phase: 'start', charged: 0, sent: 0, ev: 'start' }),
  step(s, p, fix) {
    const phase = idemPhases(p.retries, fix)[s.n + 1];
    const charged = s.charged + (phase === 'apply' || phase === 'charge' ? IDEM.amount : 0);
    const sent = s.sent + (phase === 'send' || phase === 'resend' ? 1 : 0);
    return { n: s.n + 1, phase, charged, sent, ev: phase };
  },
};

/* ---------- blue-green deploy ---------- */

export type Up = 'up' | 'down' | 'starting' | 'broken' | 'idle';
export interface BgFrame { ev: string; a: Up; b: Up; route: 'a' | 'b' | 'none' }
/** a is the current version, b the new one. Without the practice both run in the same slot. */
export function bgFrames(fix: boolean, bug: boolean): BgFrame[] {
  const nb: Up = bug ? 'broken' : 'up';
  if (!fix) {
    const f: BgFrame[] = [
      { ev: 'live', a: 'up', b: 'idle', route: 'a' },
      { ev: 'stop', a: 'down', b: 'idle', route: 'none' },
      { ev: 'install', a: 'down', b: 'starting', route: 'none' },
      { ev: bug ? 'bad' : 'newlive', a: 'down', b: nb, route: 'b' },
    ];
    if (bug) f.push({ ev: 'rollstop', a: 'starting', b: 'down', route: 'none' }, { ev: 'rolled', a: 'up', b: 'idle', route: 'a' });
    return f;
  }
  const f: BgFrame[] = [
    { ev: 'live', a: 'up', b: 'idle', route: 'a' },
    { ev: 'deploy', a: 'up', b: 'starting', route: 'a' },
  ];
  if (bug) f.push({ ev: 'checkfail', a: 'up', b: 'broken', route: 'a' }, { ev: 'kept', a: 'up', b: 'idle', route: 'a' });
  else f.push({ ev: 'checkok', a: 'up', b: 'up', route: 'a' }, { ev: 'switch', a: 'up', b: 'up', route: 'b' }, { ev: 'standby', a: 'idle', b: 'up', route: 'b' });
  return f;
}
export const BG = { perStep: 4 };
export interface BgState { n: number; frame: BgFrame; failed: number; served: number; ev: string }
const bgUp = (f: BgFrame) => (f.route === 'a' ? f.a : f.route === 'b' ? f.b : 'down') === 'up';

export const blueGreen: Sim<BgState> = {
  max: (p, fix) => bgFrames(fix, p.bug === 1).length - 1,
  init: (p, fix) => { const frame = bgFrames(fix, p.bug === 1)[0]; return { n: 0, frame, failed: 0, served: BG.perStep, ev: frame.ev }; },
  step(s, p, fix) {
    const frame = bgFrames(fix, p.bug === 1)[s.n + 1];
    const ok = bgUp(frame);
    return { n: s.n + 1, frame, failed: s.failed + (ok ? 0 : BG.perStep), served: s.served + (ok ? BG.perStep : 0), ev: frame.ev };
  },
};

/* ---------- fan-out / fan-in ---------- */

export const FAN = { jobs: 8 };
export interface FanState { n: number; dur: number[]; pending: number[]; slots: { job: number; left: number }[]; done: number[]; ev: 'start' | 'work' | 'merged' }

export function jobDurations(count: number, seed: number): number[] {
  const rand = mulberry32(seed);
  return Array.from({ length: count }, () => 1 + Math.floor(rand() * 3));
}

export const fanOut: Sim<FanState> = {
  // steps until the merge frame: replay until every job is done, plus the merge itself
  max(p, fix, seed) {
    let s = fanOut.init(p, fix, seed);
    let i = 0;
    while (s.ev !== 'merged' && i < 100) { s = fanOut.step(s, p, fix); i++; }
    return i;
  },
  init: (p, fix, seed) => ({
    n: 0, dur: jobDurations(FAN.jobs, seed), pending: Array.from({ length: FAN.jobs }, (_, i) => i),
    slots: Array.from({ length: fix ? p.workers : 1 }, () => ({ job: -1, left: 0 })), done: [], ev: 'start',
  }),
  step(s) {
    if (s.done.length === s.dur.length) return { ...s, n: s.n + 1, ev: 'merged' };
    const pending = s.pending.slice();
    const done = s.done.slice();
    const slots = s.slots.map((sl) => {
      if (sl.job >= 0 && sl.left > 1) return { job: sl.job, left: sl.left - 1 };
      if (sl.job >= 0) done.push(sl.job);
      const job = pending.shift();
      return job === undefined ? { job: -1, left: 0 } : { job, left: s.dur[job] };
    });
    return { ...s, n: s.n + 1, pending, slots, done, ev: done.length === s.dur.length ? 'merged' : 'work' };
  },
};

/* ---------- eventual consistency ---------- */

export const EC = { writes: [1, 7] as number[] };
export interface EcMsg { to: number; v: number; sent: number; at: number }
export interface EcState { n: number; vals: number[]; msgs: EcMsg[]; written: number; reads: number; stale: number; last: { from: number; v: number; stale: boolean } | null; converged: number; ev: 'start' | 'write' | 'stale' | 'fresh' }

export const eventual: Sim<EcState> = {
  max: () => 14,
  init: () => ({ n: 0, vals: [0, 0, 0], msgs: [], written: 0, reads: 0, stale: 0, last: null, converged: 0, ev: 'start' }),
  step(s, p, fix) {
    const n = s.n + 1;
    const vals = s.vals.slice();
    let msgs = s.msgs.filter((m) => {
      if (m.at > n) return true;
      vals[m.to] = m.v;
      return false;
    });
    const wi = EC.writes.indexOf(n);
    if (wi >= 0) {
      const v = wi + 1;
      vals[0] = v;
      // follower 2 is one tick further away than follower 1
      msgs = [...msgs, { to: 1, v, sent: n, at: n + p.delay }, { to: 2, v, sent: n, at: n + p.delay + 1 }];
      return { ...s, n, vals, msgs, written: v, last: null, ev: 'write' };
    }
    const settled = vals.every((x) => x === s.written);
    // without the practice reads rotate across replicas; with read-your-writes they stay on the leader until replicas catch up
    const from = fix && !settled ? 0 : n % 3;
    const stale = vals[from] !== s.written;
    const converged = s.converged + (settled ? 0 : 1);
    return { ...s, n, vals, msgs, reads: s.reads + 1, stale: s.stale + (stale ? 1 : 0), last: { from, v: vals[from], stale }, converged, ev: stale ? 'stale' : 'fresh' };
  },
};

/* ---------- rate limit: token bucket in front of a server ---------- */

export const RL = { capacity: 4, bucket: 4, refill: 3 };
export interface RlTick { served: number; rejected: number; errors: number }
export interface RlState { n: number; tokens: number; hist: RlTick[]; served: number; rejected: number; errors: number; ev: 'start' | 'ok' | 'limited' | 'overload' }

export const rateLimit: Sim<RlState> = {
  max: () => 12,
  init: () => ({ n: 0, tokens: RL.bucket, hist: [], served: 0, rejected: 0, errors: 0, ev: 'start' }),
  step(s, p, fix) {
    const rate = p.rate;
    let t: RlTick;
    let tokens = s.tokens;
    if (!fix) t = rate > RL.capacity ? { served: 0, rejected: 0, errors: rate } : { served: rate, rejected: 0, errors: 0 };
    else {
      const take = Math.min(rate, tokens);
      tokens -= take;
      t = { served: take, rejected: rate - take, errors: 0 };
    }
    tokens = Math.min(RL.bucket, tokens + (fix ? RL.refill : 0));
    const ev = t.errors ? 'overload' : t.rejected ? 'limited' : 'ok';
    return { n: s.n + 1, tokens, hist: [...s.hist, t], served: s.served + t.served, rejected: s.rejected + t.rejected, errors: s.errors + t.errors, ev };
  },
};

/* ---------- single-flight: N callers miss the same cache key ---------- */

export type SfPhase = 'hot' | 'expire' | 'arrive' | 'query' | 'fill' | 'answer';
export const SF_PHASES: SfPhase[] = ['hot', 'expire', 'arrive', 'query', 'fill', 'answer'];
export interface SfState { n: number; phase: SfPhase; dbCalls: number; waiting: number; ev: SfPhase }

export const singleFlight: Sim<SfState> = {
  max: () => SF_PHASES.length - 1,
  init: () => ({ n: 0, phase: 'hot', dbCalls: 0, waiting: 0, ev: 'hot' }),
  step(s, p, fix) {
    const phase = SF_PHASES[s.n + 1];
    const q = phase === 'query';
    return {
      n: s.n + 1, phase, ev: phase,
      dbCalls: s.dbCalls + (q ? (fix ? 1 : p.callers) : 0),
      waiting: q && fix ? p.callers - 1 : phase === 'answer' ? 0 : s.waiting,
    };
  },
};
