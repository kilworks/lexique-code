import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { usePrefs } from '../prefs';
import { Icon } from '../Icon';
import { run, type Params, type Sim } from '../../lib/sims';
import type { Lang } from '../../lib/types';
import '../../styles/diagrams.css';

export type L = Record<Lang, string>;

export type Control =
  | { key: string; kind: 'range'; label: L; min: number; max: number; unit?: L }
  | { key: string; kind: 'check'; label: L };

export interface Stat { label: string; value: string | number; tone?: 'bad' | 'good' }

export interface View<S> { s: S; p: Params; fix: boolean; lang: Lang; reduced: boolean; seed: number }

interface Props<S> {
  title: L;
  /** noun phrase for the toggle: "Without <practice>" / "With <practice>" */
  practice: L;
  /** static description of what the picture shows, read instead of the picture */
  summary: L;
  sim: Sim<S>;
  controls: Control[];
  defaults: Params;
  seeded?: boolean;
  /** step shown on open and after "Another run" (default 0): the frame where the idea first shows */
  start?: (p: Params, fix: boolean, seed: number) => number;
  tickMs?: number;
  caption: (v: View<S>) => string;
  stats: (v: View<S>) => Stat[];
  draw: (v: View<S>) => ReactNode;
}

const UI: Record<Lang, Record<string, string>> = {
  en: { play: 'Play', pause: 'Pause', back: 'Back', step: 'Step', reset: 'Reset', without: 'Without', with: 'With', of: 'of', stepN: 'Step', another: 'Another run', mode: 'Mode', controls: 'Diagram controls' },
  fr: { play: 'Lecture', pause: 'Pause', back: 'Retour', step: 'Avancer', reset: 'Recommencer', without: 'Sans', with: 'Avec', of: 'sur', stepN: 'Étape', another: 'Autre exécution', mode: 'Mode', controls: 'Commandes du schéma' },
};

function useReducedMotion(): boolean {
  const q = '(prefers-reduced-motion: reduce)';
  const [r, setR] = useState(() => typeof matchMedia === 'function' && matchMedia(q).matches);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const m = matchMedia(q);
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}

/** True while the element is on screen and the tab is visible. */
function useActive(ref: RefObject<HTMLElement>): boolean {
  const [seen, setSeen] = useState(true);
  const [shown, setShown] = useState(() => typeof document === 'undefined' || !document.hidden);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== 'function') return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  useEffect(() => {
    const on = () => setShown(!document.hidden);
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return seen && shown;
}

const MOVE = { duration: 380, easing: 'cubic-bezier(0.2, 0, 0, 1)' };

export function DiagramFrame<S>(props: Props<S>) {
  const { title, practice, summary, sim, controls, defaults, seeded, start, tickMs = 900, caption, stats, draw } = props;
  const { lang } = usePrefs();
  const t = UI[lang];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const active = useActive(root);
  const id = useId();

  const [p, setP] = useState<Params>(defaults);
  const [fix, setFix] = useState(false);
  const [seed, setSeed] = useState(1);
  const [n, setN] = useState(() => start?.(defaults, false, 1) ?? 0);
  const [playing, setPlaying] = useState(false);

  const max = sim.max(p, fix, seed);
  const s = useMemo(() => run(sim, p, fix, seed, n), [sim, p, fix, seed, n]);
  const v: View<S> = { s, p, fix, lang, reduced, seed };

  // Play advances one state per tick and stops at the end; it waits while off-screen or the tab is hidden.
  useEffect(() => {
    if (!playing || !active) return;
    if (n >= max) { setPlaying(false); return; }
    const id = setTimeout(() => setN((x) => Math.min(x + 1, max)), tickMs);
    return () => clearTimeout(id);
  }, [playing, active, n, max, tickMs]);

  // Tokens carry data-k (identity), data-x/data-y (target) and optional data-from ("x y" spawn point).
  // On a single step they glide from their previous spot (transform only); anything else snaps.
  const last = useRef({ n: -1, sig: '', pos: new Map<string, [number, number]>() });
  const sig = `${JSON.stringify(p)}|${fix}|${seed}|${lang}`;
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const prev = last.current;
    const animate = !reduced && prev.sig === sig && Math.abs(n - prev.n) === 1;
    const pos = new Map<string, [number, number]>();
    el.querySelectorAll<SVGElement>('[data-k]').forEach((node) => {
      node.getAnimations().forEach((a) => a.cancel());
      const k = node.dataset.k!;
      const to: [number, number] = [Number(node.dataset.x), Number(node.dataset.y)];
      pos.set(k, to);
      if (!animate) return;
      const from = prev.pos.get(k) ?? (node.dataset.from ? (node.dataset.from.split(' ').map(Number) as [number, number]) : null);
      const end = `translate(${to[0]}px, ${to[1]}px)`;
      if (from && (from[0] !== to[0] || from[1] !== to[1])) {
        node.animate([{ transform: `translate(${from[0]}px, ${from[1]}px)` }, { transform: end }], { ...MOVE, fill: 'none' });
      } else if (!from) {
        node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' });
      }
    });
    last.current = { n, sig, pos };
  });

  const restart = () => { setPlaying(false); setN(0); };
  const setParam = (k: string, x: number) => { setP((cur) => ({ ...cur, [k]: x })); };
  const stepTo = (x: number) => { setPlaying(false); setN(Math.max(0, Math.min(max, x))); };
  const toggle = () => {
    if (playing) setPlaying(false);
    else { if (n >= max) setN(0); setPlaying(true); }
  };
  const cap = caption(v);
  const outcome = stats(v);

  return (
    <figure ref={root} className="dg" lang={lang} aria-labelledby={`${id}-t`}>
      <figcaption className="dg__head">
        <span id={`${id}-t`} className="dg__title">{title[lang]}</span>
        <span className="dg__count">{t.stepN} {Math.min(n, max)} {t.of} {max}</span>
      </figcaption>

      <div className="segmented dg__mode" role="group" aria-label={t.mode}>
        <button type="button" className="segmented__btn" aria-pressed={!fix} onClick={() => { setFix(false); setPlaying(false); }}>{t.without} {practice[lang]}</button>
        <button type="button" className="segmented__btn" aria-pressed={fix} onClick={() => { setFix(true); setPlaying(false); }}>{t.with} {practice[lang]}</button>
      </div>

      <div ref={stage} className={`dg__stage${fix ? ' dg__stage--fix' : ''}`} role="img" aria-label={summary[lang]}>
        {draw(v)}
      </div>

      <p className="dg__caption" aria-live="polite">{cap}</p>

      <dl className="dg__stats">
        {outcome.map((x) => (
          <div key={x.label} className={`dg__stat${x.tone ? ` dg__stat--${x.tone}` : ''}`}>
            <dt>{x.label}</dt>
            <dd>{x.value}</dd>
          </div>
        ))}
      </dl>

      <div className="dg__controls" role="group" aria-label={t.controls}>
        <div className="dg__buttons">
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => stepTo(n - 1)} disabled={n <= 0}>
            <Icon name="chevron-left" className="ico ico--sm" /> {t.back}
          </button>
          <button type="button" className="btn btn--primary btn--sm dg__play" onClick={toggle} aria-pressed={playing}>
            {playing ? t.pause : t.play}
          </button>
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => stepTo(n + 1)} disabled={n >= max}>
            {t.step} <Icon name="chevron-right" className="ico ico--sm" />
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={restart}>{t.reset}</button>
        </div>

        {controls.map((c) => c.kind === 'range' ? (
          <label key={c.key} className="dg__range">
            <span className="dg__range-label">{c.label[lang]}</span>
            <input type="range" min={c.min} max={c.max} step={1} value={p[c.key]} onChange={(e) => setParam(c.key, Number(e.currentTarget.value))} />
            <output className="dg__range-value">{p[c.key]}{c.unit ? ` ${c.unit[lang]}` : ''}</output>
          </label>
        ) : (
          <label key={c.key} className="dg__check">
            <input type="checkbox" checked={p[c.key] === 1} onChange={(e) => setParam(c.key, e.currentTarget.checked ? 1 : 0)} />
            <span>{c.label[lang]}</span>
          </label>
        ))}

        {seeded && (
          <div className="dg__seed">
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setPlaying(false); setSeed(seed + 1); setN(start?.(p, fix, seed + 1) ?? 0); }}>{t.another}</button>
          </div>
        )}
      </div>
    </figure>
  );
}

/** A moving token: glides between data-x/data-y on single steps (see DiagramFrame). */
export function Tok({ k, x, y, from, r = 6, className = 'dg-tok', children }: { k: string; x: number; y: number; from?: [number, number]; r?: number; className?: string; children?: ReactNode }) {
  return (
    <g data-k={k} data-x={x} data-y={y} data-from={from ? `${from[0]} ${from[1]}` : undefined} style={{ transform: `translate(${x}px, ${y}px)` }} className={className}>
      <circle r={r} />
      {children}
    </g>
  );
}

/** A box with a centered label. */
export function Box({ x, y, w, h, label, sub, tone }: { x: number; y: number; w: number; h: number; label: string; sub?: string; tone?: 'bad' | 'good' | 'off' }) {
  return (
    <g className={`dg-box${tone ? ` dg-box--${tone}` : ''}`}>
      <rect x={x} y={y} width={w} height={h} rx={6} />
      <text x={x + w / 2} y={y + (sub ? h / 2 - 3 : h / 2 + 4)} textAnchor="middle" className="dg-label">{label}</text>
      {sub && <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" className="dg-sub">{sub}</text>}
    </g>
  );
}

/** An edge that draws itself (stroke-dashoffset on pathLength 100) whenever `run` changes. */
export function Edge({ d, run: replay, tone }: { d: string; run?: string | number; tone?: 'bad' | 'good' | 'off' }) {
  return (
    <>
      <path d={d} className="dg-edge dg-edge--base" pathLength={100} />
      {replay !== undefined && <path key={replay} d={d} className={`dg-edge dg-edge--draw${tone ? ` dg-edge--${tone}` : ''}`} pathLength={100} />}
    </>
  );
}
