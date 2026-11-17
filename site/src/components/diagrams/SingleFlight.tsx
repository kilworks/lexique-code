import { singleFlight, type SfPhase } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Single-flight: one query for many identical misses', practice: 'single-flight',
    summary: 'Callers on the left read the same key through a cache in the middle; the database is on the right. When the entry expires they all miss together. Without single-flight each one queries the database; with it the first caller queries and the others wait for its answer.',
    cache: 'Cache', db: 'Database', callers: 'Callers', load: 'queries:',
    cs: { hot: 'hit', expire: 'expired', arrive: 'miss', query: 'miss', fill: 'filled', answer: 'hit' } as Record<SfPhase, string>,
    hot: (n: number) => `${n} callers read the same key; the cache answers.`,
    expire: 'The cache entry expires.',
    arrive: (n: number) => `${n} callers miss at the same moment.`,
    queryNo: (n: number) => `Each caller queries the database: ${n} identical queries at once.`,
    queryFix: (n: number) => `The first caller queries; the other ${n - 1} wait on its flight.`,
    fill: 'The database answers; the value goes back in the cache.',
    answer: (n: number, q: number) => `All ${n} callers have the value, for ${q} database quer${q === 1 ? 'y' : 'ies'}.`,
    dbS: 'Database queries', waiting: 'Waiting on the flight',
  },
  fr: {
    title: 'Single-flight : une requête pour plein d\'échecs identiques', practice: 'single-flight',
    summary: 'Des appelants à gauche lisent la même clé via un cache au milieu ; la base est à droite. Quand l\'entrée expire, tous ratent en même temps. Sans single-flight chacun interroge la base ; avec, le premier interroge et les autres attendent sa réponse.',
    cache: 'Cache', db: 'Base', callers: 'Appelants', load: 'requêtes :',
    cs: { hot: 'trouvé', expire: 'expiré', arrive: 'raté', query: 'raté', fill: 'rempli', answer: 'trouvé' } as Record<SfPhase, string>,
    hot: (n: number) => `${n} appelants lisent la même clé ; le cache répond.`,
    expire: 'L\'entrée du cache expire.',
    arrive: (n: number) => `${n} appelants ratent au même moment.`,
    queryNo: (n: number) => `Chaque appelant interroge la base : ${n} requêtes identiques d'un coup.`,
    queryFix: (n: number) => `Le premier appelant interroge ; les ${n - 1} autres attendent sa réponse.`,
    fill: 'La base répond ; la valeur retourne dans le cache.',
    answer: (n: number, q: number) => `Les ${n} appelants ont la valeur, pour ${q} requête(s) en base.`,
    dbS: 'Requêtes en base', waiting: 'En attente du vol',
  },
};

export default function SingleFlight() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={singleFlight}
      tickMs={1200}
      defaults={{ callers: 6 }}
      controls={[{ key: 'callers', kind: 'range', label: { en: T.en.callers, fr: T.fr.callers }, min: 2, max: 10 }]}
      caption={({ s, p, fix, lang }) => {
        const t = T[lang];
        switch (s.phase) {
          case 'hot': return t.hot(p.callers);
          case 'expire': return t.expire;
          case 'arrive': return t.arrive(p.callers);
          case 'query': return fix ? t.queryFix(p.callers) : t.queryNo(p.callers);
          case 'fill': return t.fill;
          default: return t.answer(p.callers, s.dbCalls);
        }
      }}
      stats={({ s, lang }) => [
        { label: T[lang].dbS, value: s.dbCalls, tone: s.dbCalls > 1 ? 'bad' : s.dbCalls === 1 ? 'good' : undefined },
        { label: T[lang].waiting, value: s.waiting },
      ]}
      draw={({ s, p, fix, lang }) => {
        const t = T[lang];
        const ph = s.phase;
        const n = p.callers;
        const gap = Math.min(14, 128 / n);
        const home = (i: number): [number, number] => [20, 74 - ((n - 1) * gap) / 2 + i * gap];
        const at = (i: number): [number, number] => {
          if (ph === 'arrive' || (ph === 'query' && fix && i > 0)) return [112 - (i % 3) * 10, 58 + Math.floor(i / 3) * 10];
          if (ph === 'query') return [244 - (i % 3) * 10, 58 + Math.floor(i / 3) * 10];
          if (ph === 'fill') return !fix ? [244 - (i % 3) * 10, 58 + Math.floor(i / 3) * 10] : i === 0 ? [196, 64] : [112 - (i % 3) * 10, 58 + Math.floor(i / 3) * 10];
          return home(i);
        };
        const busy = ph === 'query' || ph === 'fill';
        return (
          <svg viewBox="0 -4 320 154" className="dg-svg">
            <text x={20} y={10} textAnchor="middle" className="dg-sub">{t.callers}</text>
            <Box x={122} y={50} w={68} h={48} label={t.cache} sub={t.cs[ph]} tone={ph === 'expire' || ph === 'arrive' || ph === 'query' ? 'off' : undefined} />
            <Box x={252} y={50} w={62} h={48} label={t.db} sub={`${t.load} ${s.dbCalls}`} tone={busy && !fix && n > 3 ? 'bad' : undefined} />
            <Edge d="M34 74 H122" run={ph === 'arrive' ? s.n : undefined} />
            <Edge d="M190 74 H252" run={ph === 'query' ? s.n : undefined} tone={!fix && ph === 'query' ? 'bad' : undefined} />
            {Array.from({ length: n }, (_, i) => {
              const [x, y] = at(i);
              const cls = ph === 'answer' ? 'dg-tok dg-tok--good' : ph === 'query' && (!fix || i === 0) ? (fix ? 'dg-tok' : 'dg-tok dg-tok--bad') : 'dg-tok dg-tok--muted';
              return <Tok key={i} k={`c${i}`} x={x} y={y} r={4.5} className={cls} />;
            })}
          </svg>
        );
      }}
    />
  );
}
