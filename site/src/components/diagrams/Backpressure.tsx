import { backpressure, BP } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Backpressure: a fast producer, a slow consumer', practice: 'bounded queue',
    summary: 'A producer on the left pushes items into a queue; a consumer on the right takes 2 per tick. Without a bound the queue grows until memory runs out; with a bound the producer is held back.',
    producer: 'Producer', consumer: 'Consumer', perTick: '/tick', cap: 'cap', mem: 'memory', rate: 'Producer rate',
    start: (r: number) => `Each tick the producer sends ${r} item(s) and the consumer handles ${BP.consume}. Press Step.`,
    steady: (q: number) => `Queue at ${q}: the consumer keeps up.`,
    grow: (q: number) => `Queue grew to ${q}: the producer is faster and nothing tells it to slow down.`,
    held: (h: number) => `Queue full at ${BP.cap}: the producer is told to wait (${h} item(s) held back so far). Memory stays flat.`,
    crash: `The queue passed ${BP.mem} items: out of memory, the process dies and every queued item is lost.`,
    down: 'The process is down. Reset, or turn on the bounded queue.',
    queue: 'In queue', done: 'Consumed', heldS: 'Held back', lost: 'Lost',
  },
  fr: {
    title: 'Contre-pression : producteur rapide, consommateur lent', practice: 'file bornée',
    summary: 'Un producteur à gauche pousse des éléments dans une file ; un consommateur à droite en prend 2 par tour. Sans borne la file grossit jusqu\'à saturer la mémoire ; avec une borne le producteur est freiné.',
    producer: 'Producteur', consumer: 'Consommateur', perTick: '/tour', cap: 'borne', mem: 'mémoire', rate: 'Débit du producteur',
    start: (r: number) => `À chaque tour le producteur envoie ${r} élément(s), le consommateur en traite ${BP.consume}. Appuyez sur Avancer.`,
    steady: (q: number) => `File à ${q} : le consommateur suit.`,
    grow: (q: number) => `La file monte à ${q} : le producteur va plus vite et rien ne lui dit de ralentir.`,
    held: (h: number) => `File pleine à ${BP.cap} : le producteur doit attendre (${h} élément(s) retenus). La mémoire reste stable.`,
    crash: `La file dépasse ${BP.mem} éléments : mémoire saturée, le processus meurt et tout ce qui était en file est perdu.`,
    down: 'Le processus est tombé. Recommencez, ou activez la file bornée.',
    queue: 'En file', done: 'Consommés', heldS: 'Retenus', lost: 'Perdus',
  },
};

const X0 = 90, DX = 11.5, Y = 70;

export default function Backpressure() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={backpressure}
      defaults={{ rate: 4 }}
      controls={[{ key: 'rate', kind: 'range', label: { en: T.en.rate, fr: T.fr.rate }, min: 1, max: 5, unit: { en: 'per tick', fr: 'par tour' } }]}
      caption={({ s, p, lang }) => {
        const t = T[lang];
        return s.ev === 'start' ? t.start(p.rate) : s.ev === 'steady' ? t.steady(s.queue.length) : s.ev === 'grow' ? t.grow(s.queue.length)
          : s.ev === 'held' ? t.held(s.held) : s.ev === 'crash' ? t.crash : t.down;
      }}
      stats={({ s, fix, lang }) => {
        const t = T[lang];
        return [
          { label: t.queue, value: s.queue.length, tone: s.crashed ? 'bad' : undefined },
          { label: t.done, value: s.consumed },
          fix ? { label: t.heldS, value: s.held, tone: 'good' } : { label: t.lost, value: s.crashed ? s.queue.length : 0, tone: s.crashed ? 'bad' : undefined },
        ];
      }}
      draw={({ s, p, fix, lang }) => {
        const t = T[lang];
        const limit = fix ? BP.cap : BP.mem;
        return (
          <svg viewBox="0 34 320 72" className="dg-svg">
            <Box x={6} y={46} w={70} h={48} label={t.producer} sub={`${p.rate}${t.perTick}`} />
            <Box x={248} y={46} w={66} h={48} label={t.consumer} sub={`${BP.consume}${t.perTick}`} tone={s.crashed ? 'off' : undefined} />
            <Edge d={`M76 ${Y} H82`} />
            <Edge d={`M${X0 - 4 + limit * DX} ${Y} H248`} />
            <rect x={X0 - 8} y={Y - 12} width={limit * DX + 4} height={24} rx={4} className={`dg-lane${s.crashed ? ' dg-lane--bad' : ''}`} />
            <text x={X0 - 8 + limit * DX + 4} y={Y + 26} textAnchor="end" className="dg-sub">{fix ? `${t.cap} ${BP.cap}` : `${t.mem} ${BP.mem}`}</text>
            {s.queue.slice(0, 14).map((id, i) => (
              <Tok key={id} k={`q${id}`} x={X0 + i * DX} y={Y} r={4.5} from={[40, Y]} className={`dg-tok${s.crashed ? ' dg-tok--bad' : ''}`} />
            ))}
            {s.crashed && <text x={160} y={Y - 22} textAnchor="middle" className="dg-label dg-label--bad">{lang === 'en' ? 'out of memory' : 'mémoire saturée'}</text>}
          </svg>
        );
      }}
    />
  );
}
