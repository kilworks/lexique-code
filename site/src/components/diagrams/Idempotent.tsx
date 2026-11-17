import { IDEM, idempotent } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const KEY = 'k-42';
const T = {
  en: {
    title: 'Idempotent: a payment retried after a lost reply', practice: 'idempotency key',
    summary: 'A client on the left sends a payment to a server on the right. The reply is lost, so the client retries. Without a key every retry charges again; with an idempotency key the server recognizes the retry and returns the stored result.',
    client: 'Client', server: 'Server', charged: 'charged', retries: 'Retries',
    start: `The customer pays ${IDEM.amount} once. Press Step to send the request.`,
    send: (fix: boolean) => fix ? `Request sent: charge ${IDEM.amount}, key ${KEY}.` : `Request sent: charge ${IDEM.amount}.`,
    apply: `The server charges ${IDEM.amount} and replies.`,
    lost: 'The reply is lost on the network. The client times out and cannot tell whether the charge happened.',
    resend: (fix: boolean) => fix ? `The client retries the same payment with the same key ${KEY}.` : 'The client retries the same payment.',
    charge: (c: number) => `The server sees a new request and charges ${IDEM.amount} again: ${c} so far.`,
    dedupe: `The server has already seen key ${KEY}: it returns the stored result and charges nothing.`,
    reply: (c: number) => `The reply arrives. The customer was charged ${c} for one payment.`,
    sent: 'Requests sent', chargedS: 'Charged',
  },
  fr: {
    title: 'Idempotent : un paiement relancé après une réponse perdue', practice: 'clé d\'idempotence',
    summary: 'Un client à gauche envoie un paiement à un serveur à droite. La réponse se perd, le client relance. Sans clé chaque relance débite à nouveau ; avec une clé d\'idempotence le serveur reconnaît la relance et renvoie le résultat déjà stocké.',
    client: 'Client', server: 'Serveur', charged: 'débité', retries: 'Relances',
    start: `Le client paie ${IDEM.amount} une fois. Appuyez sur Avancer pour envoyer la requête.`,
    send: (fix: boolean) => fix ? `Requête envoyée : débiter ${IDEM.amount}, clé ${KEY}.` : `Requête envoyée : débiter ${IDEM.amount}.`,
    apply: `Le serveur débite ${IDEM.amount} et répond.`,
    lost: 'La réponse se perd sur le réseau. Le client attend en vain et ne sait pas si le débit a eu lieu.',
    resend: (fix: boolean) => fix ? `Le client relance le même paiement avec la même clé ${KEY}.` : 'Le client relance le même paiement.',
    charge: (c: number) => `Le serveur voit une nouvelle requête et débite ${IDEM.amount} de plus : ${c} au total.`,
    dedupe: `Le serveur connaît déjà la clé ${KEY} : il renvoie le résultat stocké et ne débite rien.`,
    reply: (c: number) => `La réponse arrive. Le client a été débité de ${c} pour un seul paiement.`,
    sent: 'Requêtes envoyées', chargedS: 'Débité',
  },
};

const Y = 54, RY = 86;

export default function Idempotent() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={idempotent}
      tickMs={1300}
      defaults={{ retries: 2 }}
      controls={[{ key: 'retries', kind: 'range', label: { en: T.en.retries, fr: T.fr.retries }, min: 1, max: 3 }]}
      caption={({ s, fix, lang }) => {
        const t = T[lang];
        switch (s.phase) {
          case 'start': return t.start;
          case 'send': return t.send(fix);
          case 'apply': return t.apply;
          case 'lost': return t.lost;
          case 'resend': return t.resend(fix);
          case 'charge': return t.charge(s.charged);
          case 'dedupe': return t.dedupe;
          default: return t.reply(s.charged);
        }
      }}
      stats={({ s, lang }) => {
        const t = T[lang];
        return [
          { label: t.sent, value: s.sent },
          { label: t.chargedS, value: s.charged, tone: s.charged > IDEM.amount ? 'bad' : s.phase === 'reply' ? 'good' : undefined },
        ];
      }}
      draw={({ s, fix, lang }) => {
        const t = T[lang];
        const ph = s.phase;
        const showReq = ph !== 'start' && ph !== 'lost' && ph !== 'reply';
        const bad = s.charged > IDEM.amount;
        return (
          <svg viewBox="0 24 320 82" className="dg-svg">
            <Box x={6} y={30} w={70} h={70} label={t.client} />
            <Box x={244} y={30} w={70} h={70} label={t.server} sub={`${t.charged} ${s.charged}`} tone={bad ? 'bad' : undefined} />
            <Edge d={`M76 ${Y} H244`} run={ph === 'send' || ph === 'resend' ? s.n : undefined} />
            <Edge d={`M244 ${RY} H76`} run={ph === 'lost' || ph === 'reply' ? s.n : undefined} tone={ph === 'lost' ? 'bad' : undefined} />
            {fix && ph !== 'start' && <text x={160} y={Y - 8} textAnchor="middle" className="dg-sub">{KEY}</text>}
            {showReq && (
              <Tok key={`rq${s.sent}`} k={`rq${s.sent}`} x={232} y={Y} from={[60, Y]} className={ph === 'charge' ? 'dg-tok dg-tok--bad' : ph === 'dedupe' ? 'dg-tok dg-tok--muted' : 'dg-tok'} />
            )}
            {ph === 'lost' && (
              <Tok k="rs-lost" x={160} y={RY} from={[244, RY]} className="dg-tok dg-tok--bad">
                <path d="M-4 -4 L4 4 M4 -4 L-4 4" className="dg-x" />
              </Tok>
            )}
            {ph === 'reply' && <Tok k="rs-ok" x={84} y={RY} from={[244, RY]} className="dg-tok dg-tok--good" />}
          </svg>
        );
      }}
    />
  );
}
