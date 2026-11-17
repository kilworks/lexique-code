import { useEffect, useRef } from 'react';
import { usePrefs } from '../prefs';
import { firstLost, race, RACE, staleRead, type RaceState } from '../../lib/sims';
import { DiagramFrame } from './Frame';

const T = {
  en: {
    title: 'Race condition: threads racing on a shared counter', practice: 'lock',
    summary: 'Each lane is a thread; hollow dots are reads, filled dots are writes, in the order they happened. The line on top is the shared counter. Without a lock, two threads can read the same value and one write erases the other; with a lock each read and write pair runs alone.',
    threads: 'Threads',
    start: (n: number) => `${n} threads each add 1 to a shared counter ${RACE.incs} times: read the value, then write value + 1. Press Play.`,
    read: (t: number, v: number, lock: boolean) => lock ? `Thread ${t} takes the lock and reads ${v}.` : `Thread ${t} reads ${v}.`,
    write: (t: number, v: number, lock: boolean) => lock ? `Thread ${t} writes ${v} and releases the lock.` : `Thread ${t} writes ${v}.`,
    lost: (t: number, v: number, before: number) => `Thread ${t} writes ${v}, but the counter was already ${before}: its stale read erased ${before + 1 - v} update(s).`,
    expected: 'Expected', counter: 'Counter', lostS: 'Lost updates', track: 'counter',
    legend: 'Hollow dot: a read, with the value read. Filled dot: a write, with the value written. Amber: a write that erased an update, linked to its stale read.',
    end: (c: number, e: number) => c === e ? `Done: the counter reached ${e}, no update lost.` : `Done: the counter shows ${c} instead of ${e}, ${e - c} update(s) lost.`,
  },
  fr: {
    title: 'Condition de course : des threads sur un compteur partagé', practice: 'verrou',
    summary: 'Chaque ligne est un thread ; les points creux sont des lectures, les points pleins des écritures, dans l\'ordre où elles ont lieu. La ligne du haut est le compteur partagé. Sans verrou, deux threads peuvent lire la même valeur et une écriture efface l\'autre ; avec un verrou chaque paire lecture et écriture passe seule.',
    threads: 'Threads',
    start: (n: number) => `${n} threads ajoutent chacun 1 à un compteur partagé, ${RACE.incs} fois : lire la valeur, puis écrire valeur + 1. Appuyez sur Lecture.`,
    read: (t: number, v: number, lock: boolean) => lock ? `Le thread ${t} prend le verrou et lit ${v}.` : `Le thread ${t} lit ${v}.`,
    write: (t: number, v: number, lock: boolean) => lock ? `Le thread ${t} écrit ${v} et rend le verrou.` : `Le thread ${t} écrit ${v}.`,
    lost: (t: number, v: number, before: number) => `Le thread ${t} écrit ${v}, mais le compteur valait déjà ${before} : sa lecture périmée efface ${before + 1 - v} mise(s) à jour.`,
    expected: 'Attendu', counter: 'Compteur', lostS: 'Mises à jour perdues', track: 'compteur',
    legend: 'Point creux : une lecture, avec la valeur lue. Point plein : une écriture, avec la valeur écrite. Ambre : une écriture qui a effacé une mise à jour, reliée à sa lecture périmée.',
    end: (c: number, e: number) => c === e ? `Fini : le compteur atteint ${e}, aucune mise à jour perdue.` : `Fini : le compteur affiche ${c} au lieu de ${e}, ${e - c} mise(s) à jour perdue(s).`,
  },
};

/** counter value just before log entry i */
const before = (s: RaceState, i: number) => {
  for (let j = i - 1; j >= 0; j--) if (s.log[j].op === 'w') return s.log[j].v;
  return 0;
};

function RaceCanvas({ s, threads, track }: { s: RaceState; threads: number; track: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const { theme } = usePrefs();
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let frame = 0;
    const paint = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const w = cv.clientWidth, h = cv.clientHeight, dpr = window.devicePixelRatio || 1;
        if (!w || !h) return;
        if (cv.width !== Math.round(w * dpr)) cv.width = Math.round(w * dpr);
        if (cv.height !== Math.round(h * dpr)) cv.height = Math.round(h * dpr);
        const g = cv.getContext('2d');
        if (!g) return;
        const css = getComputedStyle(cv);
        const col = (v: string) => css.getPropertyValue(v).trim();
        const ink = col('--color-text'), muted = col('--color-text-muted'), line = col('--color-border-strong'), accent = col('--color-accent'), warn = col('--color-warn');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, w, h);
        g.font = `12px ${col('--font-sans') || 'sans-serif'}`;
        const total = threads * RACE.incs * 2;
        const left = 34, right = w - 22, top = 52, laneH = Math.min(22, (h - top - 8) / threads);
        const x = (i: number) => left + ((i + 0.5) / total) * (right - left);
        const y = (t: number) => top + (t + 0.5) * laneH;
        // lanes (secondary)
        g.strokeStyle = line; g.lineWidth = 1; g.fillStyle = muted;
        for (let t = 0; t < threads; t++) {
          g.beginPath(); g.moveTo(left, y(t)); g.lineTo(right, y(t)); g.globalAlpha = 0.5; g.stroke(); g.globalAlpha = 1;
          g.fillText(`T${t + 1}`, 4, y(t) + 4);
        }
        // counter track (focal): expected staircase dashed, actual solid
        const cy = (v: number) => 40 - (v / (threads * RACE.incs)) * 32;
        g.setLineDash([3, 3]); g.strokeStyle = muted; g.beginPath(); g.moveTo(left, cy(0));
        let exp = 0;
        s.log.forEach((o, i) => { if (o.op === 'w') { exp++; g.lineTo(x(i), cy(exp - 1)); g.lineTo(x(i), cy(exp)); } });
        g.stroke(); g.setLineDash([]);
        g.strokeStyle = s.lost > 0 ? warn : accent; g.lineWidth = 2; g.beginPath(); g.moveTo(left, cy(0));
        s.log.forEach((o, i) => { if (o.op === 'w') { g.lineTo(x(i), cy(before(s, i))); g.lineTo(x(i), cy(o.v)); } });
        g.stroke(); g.lineWidth = 1;
        // track label on the left, current value at the end of the line
        g.fillStyle = muted; g.fillText(track, 4, 12);
        const lastW = s.log.map((o, i) => (o.op === 'w' ? i : -1)).filter((i) => i >= 0).pop();
        g.fillStyle = s.lost > 0 ? warn : ink; g.font = `600 12px ${col('--font-sans') || 'sans-serif'}`;
        g.fillText(String(s.counter), (lastW === undefined ? left : x(lastW)) + 6, cy(s.counter) + 4);
        g.font = `11px ${col('--font-sans') || 'sans-serif'}`;
        // operations: read = ring, write = dot, each with its value above; a lost write is amber and arcs back
        // to the stale read it was computed from
        const r = Math.min(5, laneH / 2 - 1);
        const roomy = (right - left) / total >= 12; // values fit beside every dot; when crowded only the lost ones keep theirs
        const stale = new Set<number>();
        s.log.forEach((o, i) => { if (o.lost) stale.add(staleRead(s.log, i)); });
        s.log.forEach((o, i) => {
          if (!o.lost) return;
          const j = staleRead(s.log, i);
          if (j < 0) return;
          const x0 = x(j), x1 = x(i), py = y(o.t);
          g.strokeStyle = warn; g.lineWidth = 1.5; g.setLineDash([3, 2]);
          g.beginPath(); g.moveTo(x0 + r, py); g.quadraticCurveTo((x0 + x1) / 2, py - laneH * 0.8, x1 - r, py); g.stroke(); // inside its own lane: the thread has no other op in between
          g.setLineDash([]);
        });
        s.log.forEach((o, i) => {
          const px = x(i), py = y(o.t);
          const bad = o.lost || stale.has(i);
          g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2);
          if (o.op === 'r') { g.strokeStyle = bad ? warn : muted; g.lineWidth = 1.5; g.stroke(); }
          else { g.fillStyle = o.lost ? warn : accent; g.fill(); }
          g.lineWidth = 1;
          if (roomy || bad) {
            g.fillStyle = bad ? warn : o.op === 'r' ? muted : ink;
            g.textAlign = 'center'; g.fillText(String(o.v), px, py - r - 2); g.textAlign = 'start';
          }
        });
      });
    };
    paint();
    const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(paint) : null;
    ro?.observe(cv);
    const mq = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
    mq?.addEventListener('change', paint);
    return () => { cancelAnimationFrame(frame); ro?.disconnect(); mq?.removeEventListener('change', paint); };
  }, [s, threads, theme]);
  return <canvas ref={ref} className="dg-canvas" style={{ height: `${60 + threads * 22}px` }} />;
}

export default function RaceCondition() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={race}
      seeded
      start={(p, fix, seed) => firstLost(p, fix, seed)}
      tickMs={450}
      defaults={{ threads: 4 }}
      controls={[{ key: 'threads', kind: 'range', label: { en: T.en.threads, fr: T.fr.threads }, min: 2, max: 8 }]}
      caption={({ s, p, fix, lang }) => {
        const t = T[lang];
        const o = s.log[s.log.length - 1];
        if (!o) return t.start(p.threads);
        // last step: state the measurable outcome in the live caption (the canvas has no text of its own)
        const tail = s.log.length === race.max(p, fix, 1) ? ` ${t.end(s.counter, p.threads * RACE.incs)}` : '';
        if (o.op === 'r') return t.read(o.t + 1, o.v, fix);
        if (o.lost) return t.lost(o.t + 1, o.v, before(s, s.log.length - 1)) + tail;
        return t.write(o.t + 1, o.v, fix) + tail;
      }}
      stats={({ s, lang }) => {
        const t = T[lang];
        const writes = s.log.filter((o) => o.op === 'w').length;
        return [
          { label: t.expected, value: writes },
          { label: t.counter, value: s.counter },
          { label: t.lostS, value: s.lost, tone: s.lost > 0 ? 'bad' : 'good' },
        ];
      }}
      draw={({ s, p, lang }) => (
        <>
          <RaceCanvas s={s} threads={p.threads} track={T[lang].track} />
          <p className="dg-legend">{T[lang].legend}</p>
        </>
      )}
    />
  );
}
