import { backoff, BO, histogram } from '../../lib/sims';
import { DiagramFrame } from './Frame';

const T = {
  en: {
    title: 'Backoff + jitter: retries that do not arrive together', practice: 'jitter',
    summary: 'Each row is a client, each dot a retry on a 16 second timeline; the bars below count retries per quarter second. Without jitter every client retries at the same instants, giving tall spikes; with jitter the retries spread out and the spikes flatten.',
    clients: 'Clients',
    start: (c: number) => `${c} clients hit an error at the same moment. Step to see when each one retries.`,
    plain: (k: number, w: number, c: number) => `Retry ${k}: every client waits exactly ${w} s, so all ${c} hit the server in the same instant.`,
    jit: (k: number, w: number) => `Retry ${k}: each client waits a random time up to ${w} s, so the retries spread out.`,
    peak: 'Peak per 250 ms', shown: 'Retries shown', rounds: 'Retry round',
  },
  fr: {
    title: 'Backoff + jitter : des relances qui n\'arrivent pas ensemble', practice: 'jitter',
    summary: 'Chaque ligne est un client, chaque point une relance sur 16 secondes ; les barres du bas comptent les relances par quart de seconde. Sans jitter tous les clients relancent aux mêmes instants, d\'où de hauts pics ; avec jitter les relances s\'étalent et les pics s\'aplatissent.',
    clients: 'Clients',
    start: (c: number) => `${c} clients reçoivent une erreur au même moment. Avancez pour voir quand chacun relance.`,
    plain: (k: number, w: number, c: number) => `Relance ${k} : chaque client attend exactement ${w} s, donc les ${c} frappent le serveur au même instant.`,
    jit: (k: number, w: number) => `Relance ${k} : chaque client attend un temps au hasard jusqu'à ${w} s, les relances s'étalent.`,
    peak: 'Pic par 250 ms', shown: 'Relances affichées', rounds: 'Tour de relance',
  },
};

const L = 16, R = 312, TOP = 6, ROWS = 84, BASE = 160, BAR = 50;
const tx = (t: number) => L + (t / BO.horizon) * (R - L);

export default function BackoffJitter() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={backoff}
      seeded
      tickMs={1100}
      defaults={{ clients: 24 }}
      controls={[{ key: 'clients', kind: 'range', label: { en: T.en.clients, fr: T.fr.clients }, min: 4, max: 40 }]}
      caption={({ s, p, fix, lang }) => {
        const t = T[lang];
        if (s.n === 0) return t.start(p.clients);
        const w = BO.base * 2 ** (s.n - 1);
        return fix ? t.jit(s.n, w) : t.plain(s.n, w, p.clients);
      }}
      stats={({ s, p, lang }) => {
        const t = T[lang];
        return [
          { label: t.peak, value: s.peak, tone: s.n > 0 && s.peak >= p.clients ? 'bad' : s.n > 0 ? 'good' : undefined },
          { label: t.shown, value: s.points.filter((a) => a.k <= s.n).length },
          { label: t.rounds, value: `${s.n}/${BO.rounds}` },
        ];
      }}
      draw={({ s, p }) => {
        const shown = s.points.filter((a) => a.k <= s.n);
        const hist = histogram(shown.map((a) => a.t), BO.bucket, BO.horizon);
        const top = Math.max(...hist);
        const bw = (R - L) / hist.length;
        const rowH = ROWS / p.clients;
        return (
          <svg viewBox="0 0 320 178" className="dg-svg">
            {[0, 4, 8, 12, 16].map((x) => (
              <g key={x}>
                <line x1={tx(x)} x2={tx(x)} y1={TOP} y2={BASE} className="dg-grid" />
                <text x={tx(x)} y={BASE + 14} textAnchor="middle" className="dg-sub">{x} s</text>
              </g>
            ))}
            {[1, 2, 3, 4].filter((k) => k <= s.n).map((k) => (
              <g key={`${k}-${s.n === k}`} className={s.n === k ? 'dg-fade' : 'dg-old'}>
                {shown.filter((a) => a.k === k).map((a) => (
                  <circle key={a.c} cx={tx(a.t)} cy={TOP + (a.c + 0.5) * rowH} r={Math.min(2.6, rowH / 2 + 0.6)} className="dg-dot" />
                ))}
              </g>
            ))}
            <line x1={L} x2={R} y1={BASE} y2={BASE} className="dg-axis" />
            {hist.map((h, i) => h > 0 && (
              <rect key={i} x={L + i * bw + 0.5} width={Math.max(1, bw - 1)} y={BASE - (h / p.clients) * BAR} height={(h / p.clients) * BAR} className={h === top ? 'dg-bar dg-bar--peak' : 'dg-bar'} />
            ))}
          </svg>
        );
      }}
    />
  );
}
