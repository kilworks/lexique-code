import { EC, eventual } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Eventual consistency: replicas that catch up later', practice: 'read-your-writes',
    summary: 'A client on the left writes to a leader replica; two followers receive the change after a delay. Without care, a read that lands on a follower that has not caught up returns the old value. Read-your-writes keeps the client on the leader until followers converge.',
    client: 'Client', names: ['Leader', 'Follower 1', 'Follower 2'], delay: 'Replication delay', ticks: 'ticks',
    start: 'One leader, two followers. Writes go to the leader and reach the followers later.',
    write: (v: number) => `The client writes x = ${v} to the leader. The followers still have the old value.`,
    stale: (r: string, got: number, v: number) => `The client reads x from ${r}: gets ${got}, but it wrote ${v}. Stale read.`,
    fresh: (r: string, v: number) => `The client reads x from ${r}: gets ${v}, up to date.`,
    ryw: (v: number) => `Read-your-writes: the read goes to the leader until the followers catch up: x = ${v}.`,
    reads: 'Reads', staleS: 'Stale reads', lag: 'Ticks not converged',
  },
  fr: {
    title: 'Cohérence à terme : des répliques qui rattrapent plus tard', practice: 'lecture de ses écritures',
    summary: 'Un client à gauche écrit sur une réplique leader ; deux suiveuses reçoivent le changement après un délai. Sans précaution, une lecture qui tombe sur une suiveuse en retard renvoie l\'ancienne valeur. Lire ses propres écritures garde le client sur le leader tant que les suiveuses n\'ont pas convergé.',
    client: 'Client', names: ['Leader', 'Suiveuse 1', 'Suiveuse 2'], delay: 'Délai de réplication', ticks: 'tours',
    start: 'Un leader, deux suiveuses. Les écritures vont au leader et atteignent les suiveuses plus tard.',
    write: (v: number) => `Le client écrit x = ${v} sur le leader. Les suiveuses ont encore l'ancienne valeur.`,
    stale: (r: string, got: number, v: number) => `Le client lit x sur ${r} : obtient ${got}, alors qu'il a écrit ${v}. Lecture périmée.`,
    fresh: (r: string, v: number) => `Le client lit x sur ${r} : obtient ${v}, à jour.`,
    ryw: (v: number) => `Lecture de ses écritures : la lecture va au leader tant que les suiveuses n'ont pas rattrapé : x = ${v}.`,
    reads: 'Lectures', staleS: 'Lectures périmées', lag: 'Tours non convergés',
  },
};

const RX = 206, RW = 108, RH = 36;
const ry = (i: number) => 6 + i * 46;

export default function EventualConsistency() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={eventual}
      tickMs={900}
      defaults={{ delay: 3 }}
      controls={[{ key: 'delay', kind: 'range', label: { en: T.en.delay, fr: T.fr.delay }, min: 1, max: 5, unit: { en: T.en.ticks, fr: T.fr.ticks } }]}
      caption={({ s, fix, lang }) => {
        const t = T[lang];
        if (s.ev === 'start') return t.start;
        if (s.ev === 'write') return t.write(s.written);
        const l = s.last!;
        if (s.ev === 'stale') return t.stale(t.names[l.from], l.v, s.written);
        const settled = s.vals.every((x) => x === s.written);
        return fix && l.from === 0 && !settled ? t.ryw(l.v) : t.fresh(t.names[l.from], l.v);
      }}
      stats={({ s, lang }) => {
        const t = T[lang];
        return [
          { label: t.reads, value: s.reads },
          { label: t.staleS, value: s.stale, tone: s.stale ? 'bad' : s.reads ? 'good' : undefined },
          { label: t.lag, value: s.converged },
        ];
      }}
      draw={({ s, lang }) => {
        const t = T[lang];
        const l = s.last;
        return (
          <svg viewBox="0 0 320 146" className="dg-svg">
            <Box x={6} y={50} w={64} h={44} label={t.client} />
            {s.vals.map((v, i) => (
              <Box key={i} x={RX} y={ry(i)} w={RW} h={RH} label={t.names[i]} sub={`x = ${v}`} tone={s.written > 0 && v !== s.written ? 'off' : undefined} />
            ))}
            <path d={`M${RX - 14} ${ry(0) + RH / 2} V${ry(2) + RH / 2}`} className="dg-edge dg-edge--base" />
            {s.ev === 'write' && <Edge d={`M70 72 L${RX} ${ry(0) + RH / 2}`} run={s.n} />}
            {l && <Edge d={`M70 72 L${RX} ${ry(l.from) + RH / 2}`} run={s.n} tone={l.stale ? 'bad' : 'good'} />}
            {s.msgs.map((m) => {
              const f = Math.min(1, (s.n - m.sent) / (m.at - m.sent));
              const y0 = ry(0) + RH / 2, y1 = ry(m.to) + RH / 2;
              return <Tok key={`${m.to}-${m.v}`} k={`m${m.to}-${m.v}`} x={RX - 14} y={y0 + (y1 - y0) * f} r={5} className="dg-tok dg-tok--muted" />;
            })}
            {EC.writes.includes(s.n) && <text x={138} y={46} textAnchor="middle" className="dg-sub">{`x = ${s.written}`}</text>}
          </svg>
        );
      }}
    />
  );
}
