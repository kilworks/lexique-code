import { CB, circuitBreaker, type Breaker } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Circuit breaker: stop calling a service that is down', practice: 'breaker',
    summary: 'A client on the left calls a service on the right, through a breaker in the middle. Failed calls wait a full timeout. With the breaker, repeated failures open it and later calls fail fast until a trial call succeeds.',
    client: 'Client', service: 'Service', failLbl: 'fail', none: 'direct call', rate: 'Service failure rate',
    state: { closed: 'closed', open: 'open', half: 'half-open' } as Record<Breaker, string>,
    start: (r: number) => `Each step is one call. The service fails ${r}% of the time, and each failure costs a full timeout.`,
    ok: 'The call succeeded.',
    failNo: 'The call timed out after waiting the full timeout. The client keeps hammering the sick service.',
    fail: (f: number) => `The call timed out (${f} of ${CB.threshold} failures in a row).`,
    trip: `${CB.threshold} failures in a row: the breaker opens. Next calls fail fast without touching the service.`,
    fast: (w: number) => `Breaker open: the call is rejected at once (${w} more before a trial call).`,
    half: 'Cooldown over: the breaker is half-open, the next call is a trial.',
    close: 'The trial call succeeded: the breaker closes and traffic flows again.',
    reopen: 'The trial call failed: the breaker opens for another cooldown.',
    okS: 'Succeeded', slow: 'Timed out (slow)', fastS: 'Failed fast',
  },
  fr: {
    title: 'Disjoncteur : arrêter d\'appeler un service en panne', practice: 'disjoncteur',
    summary: 'Un client à gauche appelle un service à droite, à travers un disjoncteur au milieu. Un appel en échec attend tout le délai. Avec le disjoncteur, des échecs répétés l\'ouvrent et les appels suivants échouent tout de suite jusqu\'à ce qu\'un appel d\'essai réussisse.',
    client: 'Client', service: 'Service', failLbl: 'échec', none: 'appel direct', rate: 'Taux d\'échec du service',
    state: { closed: 'fermé', open: 'ouvert', half: 'semi-ouvert' } as Record<Breaker, string>,
    start: (r: number) => `Chaque étape est un appel. Le service échoue ${r} % du temps, et chaque échec coûte tout le délai d'attente.`,
    ok: 'L\'appel a réussi.',
    failNo: 'L\'appel expire après avoir attendu tout le délai. Le client continue de marteler le service malade.',
    fail: (f: number) => `L'appel expire (${f} échec(s) de suite sur ${CB.threshold}).`,
    trip: `${CB.threshold} échecs de suite : le disjoncteur s'ouvre. Les appels suivants échouent tout de suite sans toucher le service.`,
    fast: (w: number) => `Disjoncteur ouvert : l'appel est refusé aussitôt (encore ${w} avant un appel d'essai).`,
    half: 'Fin du délai : le disjoncteur est semi-ouvert, le prochain appel sert d\'essai.',
    close: 'L\'appel d\'essai a réussi : le disjoncteur se ferme, le trafic reprend.',
    reopen: 'L\'appel d\'essai a échoué : le disjoncteur se rouvre pour un nouveau délai.',
    okS: 'Réussis', slow: 'Expirés (lents)', fastS: 'Refusés vite',
  },
};

const Y = 66;

export default function CircuitBreaker() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={circuitBreaker}
      seeded
      defaults={{ failRate: 70 }}
      controls={[{ key: 'failRate', kind: 'range', label: { en: T.en.rate, fr: T.fr.rate }, min: 0, max: 100, unit: { en: '%', fr: '%' } }]}
      caption={({ s, p, fix, lang }) => {
        const t = T[lang];
        switch (s.ev) {
          case 'start': return t.start(p.failRate);
          case 'ok': return t.ok;
          case 'fail': return fix ? t.fail(s.fails) : t.failNo;
          case 'trip': return t.trip;
          case 'fast': return t.fast(s.wait);
          case 'half': return t.half;
          case 'close': return t.close;
          default: return t.reopen;
        }
      }}
      stats={({ s, lang }) => {
        const t = T[lang];
        return [
          { label: t.okS, value: s.ok },
          { label: t.slow, value: s.timeouts, tone: s.timeouts ? 'bad' : undefined },
          { label: t.fastS, value: s.fast, tone: s.fast ? 'good' : undefined },
        ];
      }}
      draw={({ s, p, fix, lang }) => {
        const t = T[lang];
        const open = fix && s.breaker === 'open';
        const tok = s.last === 'ok' ? { x: 262, cls: 'dg-tok dg-tok--good' } : s.last === 'timeout' ? { x: 228, cls: 'dg-tok dg-tok--bad' } : { x: 160, cls: 'dg-tok dg-tok--muted' };
        return (
          <svg viewBox="0 36 320 60" className="dg-svg">
            <Box x={6} y={42} w={62} h={48} label={t.client} />
            <Box x={124} y={42} w={72} h={48} label={fix ? t.state[s.breaker] : t.none} sub={fix ? `${s.fails}/${CB.threshold}` : undefined} tone={open ? 'bad' : fix && s.breaker === 'half' ? 'off' : undefined} />
            <Box x={252} y={42} w={62} h={48} label={t.service} sub={`${p.failRate}% ${t.failLbl}`} tone={p.failRate >= 50 ? 'bad' : undefined} />
            <Edge d={`M68 ${Y} H124`} run={s.n} />
            <Edge d={`M196 ${Y} H252`} run={open || s.last === 'fast' ? undefined : s.n} tone={s.last === 'timeout' ? 'bad' : undefined} />
            {open && <line x1={204} y1={Y - 10} x2={244} y2={Y + 10} className="dg-cut" />}
            {s.n > 0 && <Tok key={s.n} k={`c${s.n}`} x={tok.x} y={Y - 16} r={5} from={[38, Y - 16]} className={tok.cls} />}
          </svg>
        );
      }}
    />
  );
}
