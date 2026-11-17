import { FAN, fanOut, jobDurations } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Fan-out / fan-in: independent jobs in parallel', practice: 'fan-out',
    summary: 'Eight independent jobs wait on the left; the number on each is how many ticks it takes. Without fan-out a single caller runs them one after another; with fan-out they go to several workers at once and the results are merged on the right.',
    jobs: 'Jobs', merge: 'Merge', worker: 'Worker', caller: 'Caller', workers: 'Workers', left: 'left',
    start: (fix: boolean, w: number) => fix ? `${FAN.jobs} independent jobs, sent to ${w} workers at once.` : `${FAN.jobs} independent jobs, run one after another by a single caller.`,
    work: (n: number, busy: number, done: number) => `Tick ${n}: ${busy} job(s) running, ${done} of ${FAN.jobs} merged.`,
    merged: (n: number) => `All ${FAN.jobs} results merged after ${n} ticks.`,
    elapsed: 'Ticks elapsed', mergedS: 'Merged', seq: 'One at a time',
  },
  fr: {
    title: 'Fan-out / fan-in : des tâches indépendantes en parallèle', practice: 'fan-out',
    summary: 'Huit tâches indépendantes attendent à gauche ; le nombre sur chacune est sa durée en tours. Sans fan-out un seul appelant les fait l\'une après l\'autre ; avec fan-out elles partent vers plusieurs workers à la fois et les résultats sont fusionnés à droite.',
    jobs: 'Tâches', merge: 'Fusion', worker: 'Worker', caller: 'Appelant', workers: 'Workers', left: 'restantes',
    start: (fix: boolean, w: number) => fix ? `${FAN.jobs} tâches indépendantes, envoyées à ${w} workers à la fois.` : `${FAN.jobs} tâches indépendantes, faites l'une après l'autre par un seul appelant.`,
    work: (n: number, busy: number, done: number) => `Tour ${n} : ${busy} tâche(s) en cours, ${done} sur ${FAN.jobs} fusionnées.`,
    merged: (n: number) => `Les ${FAN.jobs} résultats sont fusionnés après ${n} tours.`,
    elapsed: 'Tours écoulés', mergedS: 'Fusionnées', seq: 'Une par une',
  },
};

const WX = 128, WW = 66;

export default function FanOut() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={fanOut}
      seeded
      tickMs={800}
      defaults={{ workers: 4 }}
      controls={[{ key: 'workers', kind: 'range', label: { en: T.en.workers, fr: T.fr.workers }, min: 2, max: 6 }]}
      caption={({ s, p, fix, lang }) => {
        const t = T[lang];
        if (s.ev === 'start') return t.start(fix, p.workers);
        if (s.ev === 'merged') return t.merged(s.n);
        return t.work(s.n, s.slots.filter((x) => x.job >= 0).length, s.done.length);
      }}
      stats={({ s, lang, seed }) => {
        const t = T[lang];
        return [
          { label: t.elapsed, value: s.n, tone: s.ev === 'merged' ? 'good' : undefined },
          { label: t.mergedS, value: `${s.done.length}/${FAN.jobs}` },
          { label: t.seq, value: jobDurations(FAN.jobs, seed).reduce((a, b) => a + b, 0) + 1 },
        ];
      }}
      draw={({ s, fix, lang }) => {
        const t = T[lang];
        const k = s.slots.length;
        const gap = 136 / k;
        const wy = (i: number) => 8 + i * gap + (gap - Math.min(gap - 4, 26)) / 2;
        const wh = Math.min(gap - 4, 26);
        const pos = new Map<number, [number, number]>();
        s.pending.forEach((j, i) => pos.set(j, [22 + (i % 2) * 16, 40 + Math.floor(i / 2) * 15]));
        s.slots.forEach((sl, i) => { if (sl.job >= 0) pos.set(sl.job, [WX + WW - 12, wy(i) + wh / 2]); });
        s.done.forEach((j, i) => pos.set(j, [270 + (i % 2) * 16, 40 + Math.floor(i / 2) * 15]));
        return (
          <svg viewBox="0 0 320 152" className="dg-svg">
            <Box x={6} y={8} w={60} h={136} label="" />
            <text x={36} y={26} textAnchor="middle" className="dg-label">{t.jobs}</text>
            <Box x={254} y={8} w={60} h={136} label="" tone={s.ev === 'merged' ? 'good' : undefined} />
            <text x={284} y={26} textAnchor="middle" className="dg-label">{t.merge}</text>
            {s.slots.map((sl, i) => (
              <g key={i}>
                <Edge d={`M66 76 L${WX} ${wy(i) + wh / 2}`} />
                <Edge d={`M${WX + WW} ${wy(i) + wh / 2} L254 76`} />
                <rect x={WX} y={wy(i)} width={WW} height={wh} rx={5} className={`dg-slot${sl.job >= 0 ? ' dg-slot--busy' : ''}`} />
                <text x={WX + 6} y={wy(i) + wh / 2 + 4} className="dg-sub">{fix ? `W${i + 1}` : t.caller}</text>
              </g>
            ))}
            {[...pos.entries()].map(([j, [x, y]]) => {
              const sl = s.slots.find((q) => q.job === j);
              return (
                <Tok key={j} k={`j${j}`} x={x} y={y} r={6.5} className={s.done.includes(j) ? 'dg-tok dg-tok--good' : 'dg-tok'}>
                  <text y={3.5} textAnchor="middle" className="dg-tok-text">{sl ? sl.left : s.dur[j]}</text>
                </Tok>
              );
            })}
          </svg>
        );
      }}
    />
  );
}
