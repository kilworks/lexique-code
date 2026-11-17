import { RL, rateLimit } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Rate limit: a token bucket in front of the server', practice: 'rate limit',
    summary: 'Clients on the left send requests each tick; the server on the right can handle 4 per tick. Without a limit a burst over capacity knocks the server over and everyone gets errors. With a token bucket the excess is refused with 429 and the server stays healthy. Bars below show each tick: served, refused, errored.',
    clients: 'Clients', bucket: 'Bucket', nolimit: 'no limit', server: 'Server', max: `max ${RL.capacity}/tick`, rate: 'Request rate', per: 'per tick',
    start: `The server handles at most ${RL.capacity} requests per tick. Turn the rate up and step.`,
    ok: (n: number) => `${n} request(s) served.`,
    overload: (n: number) => `${n} requests arrive at once: the server falls over and every one of them errors, legitimate users included.`,
    limited: (a: number, r: number) => `The bucket lets ${a} through and answers ${r} with 429 Too Many Requests; the server stays healthy.`,
    served: 'Served', rejected: 'Refused (429)', errors: 'Errors',
  },
  fr: {
    title: 'Limite de débit : un seau à jetons devant le serveur', practice: 'limite de débit',
    summary: 'Des clients à gauche envoient des requêtes à chaque tour ; le serveur à droite en traite 4 par tour. Sans limite, une rafale au-delà de sa capacité le fait tomber et tout le monde reçoit des erreurs. Avec un seau à jetons l\'excédent est refusé en 429 et le serveur reste sain. Les barres du bas montrent chaque tour : servies, refusées, en erreur.',
    clients: 'Clients', bucket: 'Seau', nolimit: 'sans limite', server: 'Serveur', max: `max ${RL.capacity}/tour`, rate: 'Débit de requêtes', per: 'par tour',
    start: `Le serveur traite au plus ${RL.capacity} requêtes par tour. Montez le débit et avancez.`,
    ok: (n: number) => `${n} requête(s) servie(s).`,
    overload: (n: number) => `${n} requêtes arrivent d'un coup : le serveur tombe et chacune échoue, utilisateurs légitimes compris.`,
    limited: (a: number, r: number) => `Le seau en laisse passer ${a} et répond 429 Too Many Requests à ${r} ; le serveur reste sain.`,
    served: 'Servies', rejected: 'Refusées (429)', errors: 'Erreurs',
  },
};

const BASE = 150, U = 4;

export default function RateLimit() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={rateLimit}
      tickMs={900}
      defaults={{ rate: 7 }}
      controls={[{ key: 'rate', kind: 'range', label: { en: T.en.rate, fr: T.fr.rate }, min: 1, max: 10, unit: { en: T.en.per, fr: T.fr.per } }]}
      caption={({ s, p, lang }) => {
        const t = T[lang];
        const h = s.hist[s.hist.length - 1];
        if (!h) return t.start;
        return s.ev === 'overload' ? t.overload(p.rate) : s.ev === 'limited' ? t.limited(h.served, h.rejected) : t.ok(h.served);
      }}
      stats={({ s, lang }) => {
        const t = T[lang];
        return [
          { label: t.served, value: s.served, tone: s.served ? 'good' : undefined },
          { label: t.rejected, value: s.rejected },
          { label: t.errors, value: s.errors, tone: s.errors ? 'bad' : undefined },
        ];
      }}
      draw={({ s, p, fix, lang }) => {
        const t = T[lang];
        const h = s.hist[s.hist.length - 1];
        const down = !!h?.errors;
        const toks: { k: string; x: number; y: number; cls: string }[] = [];
        if (h) {
          for (let i = 0; i < h.served; i++) toks.push({ k: `s${i}`, x: 238 - (i % 4) * 9, y: 30 + Math.floor(i / 4) * 9, cls: 'dg-tok' });
          for (let i = 0; i < h.rejected; i++) toks.push({ k: `r${i}`, x: 126 + i * 9, y: 84, cls: 'dg-tok dg-tok--muted' });
          for (let i = 0; i < h.errors; i++) toks.push({ k: `e${i}`, x: 238 - (i % 5) * 9, y: 30 + Math.floor(i / 5) * 9, cls: 'dg-tok dg-tok--bad' });
        }
        return (
          <svg viewBox="0 10 320 156" className="dg-svg">
            <Box x={6} y={16} w={62} h={44} label={t.clients} sub={`${p.rate}/${lang === 'en' ? 'tick' : 'tour'}`} />
            <Box x={120} y={16} w={72} h={44} label={fix ? t.bucket : t.nolimit} sub={fix ? `${s.tokens}/${RL.bucket}` : undefined} tone={fix ? undefined : 'off'} />
            <Box x={250} y={16} w={64} h={44} label={t.server} sub={t.max} tone={down ? 'bad' : undefined} />
            <Edge d="M68 38 H120" run={s.n || undefined} />
            <Edge d="M192 38 H250" run={s.n || undefined} tone={down ? 'bad' : undefined} />
            {toks.map((x) => <Tok key={`${s.n}-${x.k}`} k={`${s.n}-${x.k}`} x={x.x} y={x.y} r={3.5} from={[40, 38]} className={x.cls} />)}
            <line x1={6} x2={314} y1={BASE} y2={BASE} className="dg-axis" />
            <line x1={6} x2={314} y1={BASE - RL.capacity * U} y2={BASE - RL.capacity * U} className="dg-grid" />
            <text x={314} y={BASE + 12} textAnchor="end" className="dg-sub">{`- - ${t.max}`}</text>
            {s.hist.map((x, i) => {
              const bx = 10 + i * 25;
              let y = BASE;
              const seg = (n: number, cls: string) => { y -= n * U; return n > 0 && <rect key={cls} x={bx} y={y} width={18} height={n * U} className={cls} />; };
              return <g key={i}>{seg(x.served, 'dg-bar')}{seg(x.rejected, 'dg-bar dg-bar--muted')}{seg(x.errors, 'dg-bar dg-bar--peak')}</g>;
            })}
          </svg>
        );
      }}
    />
  );
}
