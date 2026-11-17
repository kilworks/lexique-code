import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { adjacency, layoutGraph, nearestInDirection, nearestTo, type Dir, type GraphNode } from '../lib/graph';
import { search } from '../lib/search';
import '../styles/glossary.css';
import '../styles/map.css';

interface View { x: number; y: number; k: number }
const MAX_K = 4;
const LABEL_K = 1.8; // above this zoom every word shows its label (below it they would overlap)
const KEY_DIRS: Record<string, Dir> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
const plain = (s: string) => s.replace(/`/g, '');
/** Phone map title: the head word of a section ("Networking", "User interface"); the full title stays in the chips and the list. */
function headWords(t: string): string {
  const w = t.split(' ');
  return w.length > 1 && w[0].length <= 4 && w[1] !== 'and' && w[1] !== 'et' ? `${w[0]} ${w[1]}` : w[0];
}
const SETTLE_MS = 140; // a zoom gesture writes --k (label size) once it pauses, not on every step
/** Long section titles go on two lines, split at the space nearest the middle. */
function titleLines(t: string, max: number): string[] {
  if (t.length <= max || !t.includes(' ')) return [t];
  let cut = -1;
  for (let i = 0; i < t.length; i++) if (t[i] === ' ' && (cut < 0 || Math.abs(i - t.length / 2) < Math.abs(cut - t.length / 2))) cut = i;
  return [t.slice(0, cut), t.slice(cut + 1)];
}

export default function WordMap() {
  const lex = useLexicon();
  const { lang } = usePrefs();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const selected = (params.get('s') ?? '').split(',').filter((id) => lex.sections.some((s) => s.id === id && s.kind === 'words'));
  // a phone opens on the list (the full map is one tap away); wide screens open on the map
  const [listView, setListView] = useState(() => !window.matchMedia('(min-width: 40em)').matches);
  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  // wide screens get a wide grid; chosen once so positions never change under the reader
  const [cols] = useState(() => (window.matchMedia('(min-width: 40em)').matches ? 7 : 4));
  const graph = useMemo(() => layoutGraph(lex, cols), [lex, cols]);
  const adj = useMemo(() => adjacency(graph.edges), [graph]);
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const filtering = q.trim() !== '' || selected.length > 0;
  const searching = q.trim() !== '';
  const result = useMemo(() => search(lex, q, lang, selected), [lex, q, lang, selected.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const matches = useMemo(() => new Set(result.groups.flatMap((g) => g.words.map((w) => w.id))), [result]);

  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const world = useRef<SVGGElement>(null);
  const view = useRef<View>({ x: 0, y: 0, k: 1 });
  const minK = useRef(0.1);
  const settle = useRef(0);
  useEffect(() => () => clearTimeout(settle.current), []);

  // ---- view: one transform on one <g>, written straight to the DOM (no React render per frame).
  // --k sizes every label, so rewriting it restyles all 528 of them: a live gesture (wheel, pinch, drag)
  // only moves the world and writes --k once it pauses; buttons, keys and resizes write it at once.
  const apply = useCallback((v: View, mode: 'snap' | 'glide' | 'live' = 'snap') => {
    const g = world.current;
    const s = svg.current;
    if (!g || !s) return;
    const k = Math.min(MAX_K, Math.max(minK.current, v.k));
    view.current = { x: v.x, y: v.y, k };
    g.classList.toggle('map__world--glide', mode === 'glide');
    g.style.transform = `translate(${v.x}px, ${v.y}px) scale(${k})`;
    const writeK = () => {
      const kk = view.current.k;
      if (s.style.getPropertyValue('--k') !== String(kk)) s.style.setProperty('--k', String(kk));
      s.classList.toggle('map--labels', kk >= LABEL_K);
    };
    clearTimeout(settle.current);
    if (mode === 'live') {
      if (s.style.getPropertyValue('--k') !== String(k)) settle.current = window.setTimeout(writeK, SETTLE_MS);
    } else writeK();
  }, []);

  const fit = useCallback((glide = false) => {
    const el = box.current;
    if (!el) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const k = Math.min(w / graph.width, h / graph.height) * 0.96;
    minK.current = k * 0.8;
    apply({ k, x: (w - graph.width * k) / 2, y: (h - graph.height * k) / 2 }, glide ? 'glide' : 'snap');
  }, [apply, graph]);

  const zoomAt = useCallback((factor: number, sx: number, sy: number, glide = false) => {
    const v = view.current;
    const k = Math.min(MAX_K, Math.max(minK.current, v.k * factor));
    apply({ k, x: sx - ((sx - v.x) * k) / v.k, y: sy - ((sy - v.y) * k) / v.k }, glide ? 'glide' : 'live');
  }, [apply]);

  const zoomCenter = (factor: number) => {
    const el = box.current;
    if (el) zoomAt(factor, el.clientWidth / 2, el.clientHeight / 2, true);
  };

  /** Bring a node into view: centre it (and zoom in enough to read it) when it sits near the edge. */
  const reveal = useCallback((n: GraphNode, force = false) => {
    const el = box.current;
    if (!el) return;
    const v = view.current;
    const w = el.clientWidth;
    const h = el.clientHeight;
    const sx = n.x * v.k + v.x;
    const sy = n.y * v.k + v.y;
    const m = Math.min(w, h) * 0.15;
    if (!force && v.k >= LABEL_K && sx > m && sx < w - m && sy > m && sy < h - m) return;
    const k = Math.max(v.k, LABEL_K);
    apply({ k, x: w / 2 - n.x * k, y: h / 2 - n.y * k }, 'glide');
  }, [apply]);

  /** Frame a set of nodes (a filtered section, search results). */
  const frame = useCallback((ns: GraphNode[]) => {
    const el = box.current;
    if (!el || !ns.length) return;
    const xs = ns.map((n) => n.x);
    const ys = ns.map((n) => n.y);
    const pad = 40;
    const [x0, x1, y0, y1] = [Math.min(...xs) - pad, Math.max(...xs) + pad, Math.min(...ys) - pad, Math.max(...ys) + pad];
    const k = Math.min(el.clientWidth / (x1 - x0), el.clientHeight / (y1 - y0), LABEL_K);
    apply({ k, x: el.clientWidth / 2 - ((x0 + x1) / 2) * k, y: el.clientHeight / 2 - ((y0 + y1) / 2) * k }, 'glide');
  }, [apply]);

  useLayoutEffect(() => {
    if (listView) return;
    fit();
    const el = box.current;
    if (!el) return;
    // keep the same centre when the box resizes, refit only when the map was at its fitted size
    let last = { w: el.clientWidth, h: el.clientHeight };
    const ro = new ResizeObserver(() => {
      const { clientWidth: w, clientHeight: h } = el;
      if (w === last.w && h === last.h) return;
      const v = view.current;
      apply({ ...v, x: v.x + (w - last.w) / 2, y: v.y + (h - last.h) / 2 });
      minK.current = Math.min(w / graph.width, h / graph.height) * 0.96 * 0.8;
      last = { w, h };
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit, apply, graph, listView]);

  // ---- wheel and pointer: pan with drag, zoom with wheel or two fingers
  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = s.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * 0.0015), e.clientX - r.left, e.clientY - r.top);
    };
    s.addEventListener('wheel', onWheel, { passive: false });
    return () => s.removeEventListener('wheel', onWheel);
  }, [zoomAt, listView]);

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef({ moved: false, sx: 0, sy: 0 });
  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) drag.current = { moved: false, sx: e.clientX, sy: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const ps = pointers.current;
    const prev = ps.get(e.pointerId);
    if (!prev) return;
    const s = e.currentTarget;
    if (!drag.current.moved) {
      if (Math.hypot(e.clientX - drag.current.sx, e.clientY - drag.current.sy) < 4 && ps.size === 1) return;
      drag.current.moved = true;
      // capture only once it is a drag, so a plain click still lands on the word link
      for (const id of ps.keys()) { try { s.setPointerCapture(id); } catch { /* pointer already gone */ } }
    }
    const v = view.current;
    if (ps.size === 2) {
      const [a, b] = [...ps.entries()].map(([id, p]) => (id === e.pointerId ? { x: e.clientX, y: e.clientY } : p));
      const [pa, pb] = [...ps.values()];
      const r = s.getBoundingClientRect();
      const d0 = Math.hypot(pa.x - pb.x, pa.y - pb.y) || 1;
      const d1 = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2 - r.left;
      const my = (a.y + b.y) / 2 - r.top;
      const pmx = (pa.x + pb.x) / 2 - r.left;
      const pmy = (pa.y + pb.y) / 2 - r.top;
      apply({ ...v, x: v.x + mx - pmx, y: v.y + my - pmy }, 'live');
      zoomAt(d1 / d0, mx, my);
    } else {
      apply({ ...v, x: v.x + e.clientX - prev.x, y: v.y + e.clientY - prev.y }, 'live');
    }
    ps.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerEnd = (e: React.PointerEvent<SVGSVGElement>) => {
    pointers.current.delete(e.pointerId);
  };

  // ---- highlight: classes on the hot node, its neighbours and their edges, no re-render of the 528 nodes
  const hot = hover ?? active;

  const onOver = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch' || pointers.current.size) return;
    const id = (e.target as Element).closest('[data-id]')?.getAttribute('data-id') ?? null;
    if (id !== hover) setHover(id);
  };

  // ---- keyboard on the map box
  const onKey = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const el = box.current;
    if (!el) return;
    const dir = KEY_DIRS[e.key];
    if (dir && e.shiftKey) {
      const step = 80;
      const v = view.current;
      const d = { up: [0, step], down: [0, -step], left: [step, 0], right: [-step, 0] }[dir];
      apply({ ...v, x: v.x + d[0], y: v.y + d[1] });
    } else if (dir) {
      const v = view.current;
      const pool = filtering ? graph.nodes.filter((n) => matches.has(n.id)) : graph.nodes;
      const from = active ? byId.get(active) : undefined;
      const next = from
        ? nearestInDirection(pool, from, dir)
        : nearestTo(pool, (el.clientWidth / 2 - v.x) / v.k, (el.clientHeight / 2 - v.y) / v.k);
      if (next) { setHover(null); setActive(next.id); reveal(next); }
    } else if (e.key === '+' || e.key === '=') zoomCenter(1.4);
    else if (e.key === '-' || e.key === '_') zoomCenter(1 / 1.4);
    else if (e.key === '0') fit(true);
    else if (e.key === 'Enter' && active) navigate(`/word/${active}`);
    else if (e.key === 'Escape' && (active || hover)) { setActive(null); setHover(null); }
    else return;
    e.preventDefault();
  };

  const update = (next: { q?: string; s?: string[] }) => {
    const p = new URLSearchParams(params);
    const nq = next.q ?? q;
    const ns = next.s ?? selected;
    if (nq) p.set('q', nq); else p.delete('q');
    if (ns.length) p.set('s', ns.join(',')); else p.delete('s');
    setParams(p, { replace: true });
  };
  const toggleSection = (id: string) => {
    const ns = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    update({ s: ns });
    // a chip frames its sections; the search box never moves the map while typing
    const ids = new Set(search(lex, q, lang, ns).groups.flatMap((g) => g.words.map((w) => w.id)));
    if (!listView) { if (ns.length) frame(graph.nodes.filter((n) => ids.has(n.id))); else fit(true); }
  };
  const focusFirst = () => {
    const first = result.groups[0]?.words[0];
    const n = first && byId.get(first.id);
    if (!n || listView) return;
    setActive(n.id);
    reveal(n, true);
    box.current?.focus();
  };

  const wordSections = lex.sections.filter((s) => s.kind === 'words');
  const sectionTitle = (id: string) => lex.sections.find((s) => s.id === id)?.title[lang].split(' (')[0] ?? id;

  // the 528 nodes only re-render when the language or the filter changes
  const titleMax = cols === 4 ? 10 : 16;
  const scene = useMemo(() => (
    <>
      {/* disks keep one tone (a filter only fades titles, words and links); titles are drawn over the links */}
      <g className="map__clusters">
        {graph.clusters.map((c) => <circle key={c.id} className="map__cluster" cx={c.x} cy={c.y} r={c.r} />)}
      </g>
      <g className="map__edges">
        {graph.edges.map(([a, b]) => {
          const na = byId.get(a)!;
          const nb = byId.get(b)!;
          const lit = !filtering || matches.has(a) || matches.has(b);
          return <line key={`${a}|${b}`} className={`map__edge${lit ? '' : ' is-dim'}`} data-a={a} data-b={b} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} />;
        })}
      </g>
      <g className="map__titles">
        {graph.clusters.map((c) => (
          <text key={c.id} className={`map__title${filtering && !result.groups.some((g) => g.section.id === c.id) ? ' is-dim' : ''}`} x={c.x} y={c.y - c.r - 6} textAnchor="middle">
            {titleLines(cols === 4 ? headWords(sectionTitle(c.id)) : sectionTitle(c.id), titleMax).reverse().map((line, i) => <tspan key={i} x={c.x} dy={i ? '-1.15em' : 0}>{line}</tspan>)}
          </text>
        ))}
      </g>
      <g className="map__nodes">
        {graph.nodes.map((n) => {
          const cls = `map__node${filtering ? (matches.has(n.id) ? (searching ? ' is-match is-found' : ' is-match') : ' is-dim') : ''}${adj.has(n.id) ? ' is-linked' : ''}`;
          return (
            <a key={n.id} href={`#/word/${n.id}`} className={cls} data-id={n.id} tabIndex={-1}>
              <circle className="map__hit" cx={n.x} cy={n.y} r={12} />
              <circle className="map__dot" cx={n.x} cy={n.y} r={6} />
              <text className="map__label" x={n.x} y={n.y - 10} textAnchor="middle">{plain(lex.words[n.id][lang].word)}</text>
            </a>
          );
        })}
      </g>
    </>
  ), [graph, byId, adj, lex, lang, filtering, searching, matches, result, titleMax]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    const lit: Element[] = [];
    if (hot) {
      const ids = [hot, ...(adj.get(hot) ?? [])];
      for (const id of ids) {
        const el = s.querySelector(`[data-id="${CSS.escape(id)}"]`);
        if (el) lit.push(el);
      }
      lit.push(...s.querySelectorAll(`[data-a="${CSS.escape(hot)}"], [data-b="${CSS.escape(hot)}"]`));
      lit.forEach((el) => el.classList.add('is-hot'));
      s.querySelector(`[data-id="${CSS.escape(hot)}"]`)?.classList.add('is-center');
    }
    s.classList.toggle('map--hl', !!hot);
    return () => {
      lit.forEach((el) => el.classList.remove('is-hot', 'is-center'));
    };
  }, [hot, adj, listView, scene]);

  useEffect(() => {
    const s = svg.current;
    if (!s) return;
    s.querySelector('.is-focus')?.classList.remove('is-focus');
    if (active) s.querySelector(`[data-id="${CSS.escape(active)}"]`)?.classList.add('is-focus');
  }, [active, listView, scene]);

  const hotWord = hot ? lex.words[hot] : null;
  const activeWord = active ? lex.words[active] : null;

  return (
    <div className="page wordmap">
      <header className="page-head">
        <h1 className="h1">Word map</h1>
        <p className="lead">
          All {graph.nodes.length} words by section; a line joins two words that share one of the {lex.combinations.length} combinations.
        </p>
      </header>

      <div className="searchbar" role="search">
        <label htmlFor="map-search" className="sr-only">Find a word on the map</label>
        <Icon name="search" className="ico searchbar__icon" />
        <input
          id="map-search"
          type="search"
          className="searchbar__input"
          placeholder="Find a word, for example retry"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); focusFirst(); } }}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="map-search-hint"
        />
        <span id="map-search-hint" className="sr-only">Press Enter to go to the first match on the map.</span>
      </div>

      <div className="wordmap__bar">
        <p className="count" role="status" aria-live="polite">
          {filtering
            ? <><strong>{matches.size}</strong> of {graph.nodes.length} words match{q && <> &quot;{q}&quot;</>}</>
            : <><strong>{graph.nodes.length}</strong> words, {graph.edges.length} links</>}
        </p>
        <button type="button" className="btn btn--secondary btn--sm" aria-pressed={listView} onClick={() => { setListView(!listView); setActive(null); setHover(null); }}>
          <Icon name="file-text" className="ico ico--sm" /> List view
        </button>
      </div>

      <div className="chips chips--row" role="group" aria-label="Filter by section">
        <button type="button" className="chip" aria-pressed={selected.length === 0} onClick={() => { update({ s: [] }); if (!listView) fit(true); }}>
          All sections
        </button>
        {wordSections.map((s) => (
          <button key={s.id} type="button" className="chip" aria-pressed={selected.includes(s.id)} onClick={() => toggleSection(s.id)} lang={lang}>
            {s.title[lang].split(' (')[0]}
          </button>
        ))}
      </div>

      {searching && matches.size > 0 && matches.size <= 12 && (
        <ul className="wordmap__words wordmap__found" lang={lang} aria-label="Matching words">
          {result.groups.flatMap((g) => g.words).map((w) => (
            <li key={w.id}>
              <Link to={`/word/${w.id}`}><Inline text={w[lang].word} /></Link>
              <span className="muted"> {sectionTitle(w.section)}</span>
            </li>
          ))}
        </ul>
      )}

      {!listView && (
        <>
          <div className="wordmap__canvas">
          <div
            ref={box}
            className="wordmap__box"
            tabIndex={0}
            role="application"
            aria-label="Word map"
            aria-describedby="map-keys"
            onKeyDown={onKey}
            onBlur={() => setHover(null)}
          >
            <svg
              ref={svg}
              className="map"
              aria-hidden="true"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              onPointerOver={onOver}
              onPointerLeave={() => setHover(null)}
              onClickCapture={(e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } }}
            >
              <g ref={world} className="map__world" lang={lang}>{scene}</g>
            </svg>
          </div>
          <div className="segmented wordmap__zoom" role="group" aria-label="Zoom">
            <button type="button" className="segmented__btn" onClick={() => zoomCenter(1.4)}><Icon name="plus" className="ico ico--sm" /> Zoom in</button>
            <button type="button" className="segmented__btn" onClick={() => zoomCenter(1 / 1.4)}>Zoom out</button>
            <button type="button" className="segmented__btn" onClick={() => fit(true)}>Reset</button>
          </div>
          </div>
          <p id="map-keys" className="wordmap__keys muted">
            Keys on the map: <kbd>arrows</kbd> move between words, <kbd>Enter</kbd> opens the word, <kbd>Shift</kbd> + <kbd>arrows</kbd> pan,
            {' '}<kbd>+</kbd> <kbd>-</kbd> zoom, <kbd>0</kbd> resets, <kbd>Esc</kbd> clears.
            {' '}Dark dot: the word appears in a combination.
          </p>
          <p className="sr-only" aria-live="polite">
            {activeWord && `${plain(activeWord[lang].word)}, ${sectionTitle(activeWord.section)}, ${adj.get(activeWord.id)?.size ?? 0} links. ${plain(activeWord[lang].meaning)}`}
          </p>
          <div className="wordmap__detail" lang={lang}>
            {hotWord ? (
              <>
                <p className="wordmap__word">
                  <Link to={`/word/${hotWord.id}`} tabIndex={hotWord.id === active ? 0 : -1}><Inline text={hotWord[lang].word} /></Link>
                  <span className="muted"> {sectionTitle(hotWord.section)}</span>
                </p>
                <p className="muted"><Inline text={hotWord[lang].meaning} /></p>
                {(adj.get(hotWord.id)?.size ?? 0) > 0 && (
                  <p className="wordmap__links">
                    Linked to{' '}
                    {[...adj.get(hotWord.id)!].map((id, i) => (
                      <span key={id}>{i > 0 && ', '}<Inline text={lex.words[id][lang].word} /></span>
                    ))}
                  </p>
                )}
              </>
            ) : (
              <p className="muted" lang="en">Point at a word, or focus the map and use the arrow keys.</p>
            )}
          </div>
        </>
      )}

      <div className={listView ? 'wordmap__list' : 'sr-only'} lang={lang}>
        <h2 className={listView ? 'h2' : undefined}>All words by section</h2>
        {result.groups.map((g) => (
          <section key={g.section.id} aria-labelledby={`ml-${g.section.id}`}>
            <h3 className="result-group__title" id={`ml-${g.section.id}`}>{sectionTitle(g.section.id)} <span className="muted">{g.words.length}</span></h3>
            <ul className="wordmap__words">
              {g.words.map((w) => {
                const links = [...(adj.get(w.id) ?? [])];
                return (
                  <li key={w.id}>
                    <Link to={`/word/${w.id}`} tabIndex={listView ? undefined : -1}><Inline text={w[lang].word} /></Link>
                    {links.length > 0 && (
                      <span className="muted"> linked to {links.map((id, i) => (
                        <span key={id}>{i > 0 && ', '}<Link to={`/word/${id}`} tabIndex={listView ? undefined : -1}><Inline text={lex.words[id][lang].word} /></Link></span>
                      ))}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {result.groups.length === 0 && <p className="muted" lang="en">No word matches this search or filter.</p>}
      </div>
    </div>
  );
}
