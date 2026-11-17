import { BG, blueGreen, type Up } from '../../lib/sims';
import { Box, DiagramFrame, Edge, Tok } from './Frame';

const T = {
  en: {
    title: 'Blue-green: switch traffic between two full environments', practice: 'blue-green',
    summary: 'A router on the left sends user requests to the live version on the right. In place, the old version is stopped before the new one runs, so requests fail. Blue-green starts the new version next to the old one, checks it, then flips the router.',
    router: 'Router', server: 'Server', blue: 'Blue v1', green: 'Green v2', bug: 'The new version has a bug',
    st: { up: 'live', down: 'stopped', starting: 'starting', broken: 'broken', idle: 'idle' } as Record<Up, string>,
    inPlace: { live: 'v1 running', stop: 'stopped', install: 'installing v2', newlive: 'v2 running', bad: 'v2 broken', rollstop: 'reinstalling v1', rolled: 'v1 running' } as Record<string, string>,
    ev: {
      live: 'v1 serves all traffic.',
      stop: 'To install v2 in place, v1 is stopped first: requests fail.',
      install: 'v2 installs on the same machine: still down.',
      newlive: 'v2 is running. Users saw errors during the swap.',
      bad: 'v2 starts but it is broken: every request errors.',
      rollstop: 'Rolling back means stopping v2 and reinstalling v1: down again.',
      rolled: 'v1 is back, after two outages.',
      deploy: 'Green (v2) starts next to blue (v1); blue keeps serving.',
      checkok: 'Green passes its health check while blue still serves.',
      checkfail: 'Green fails its health check. Traffic never moved.',
      kept: 'Green is thrown away; users never noticed.',
      switch: 'The router flips to green in one step.',
      standby: 'Blue stays idle, ready for an instant rollback.',
    } as Record<string, string>,
    failed: 'Failed requests', served: 'Served',
  },
  fr: {
    title: 'Blue-green : basculer le trafic entre deux environnements complets', practice: 'blue-green',
    summary: 'Un routeur à gauche envoie les requêtes vers la version en ligne à droite. Sur place, l\'ancienne version est arrêtée avant que la nouvelle tourne, donc des requêtes échouent. Le blue-green démarre la nouvelle version à côté de l\'ancienne, la vérifie, puis bascule le routeur.',
    router: 'Routeur', server: 'Serveur', blue: 'Bleu v1', green: 'Vert v2', bug: 'La nouvelle version a un bug',
    st: { up: 'en ligne', down: 'arrêté', starting: 'démarre', broken: 'cassé', idle: 'au repos' } as Record<Up, string>,
    inPlace: { live: 'v1 tourne', stop: 'arrêté', install: 'installe v2', newlive: 'v2 tourne', bad: 'v2 cassée', rollstop: 'réinstalle v1', rolled: 'v1 tourne' } as Record<string, string>,
    ev: {
      live: 'v1 sert tout le trafic.',
      stop: 'Pour installer v2 sur place, on arrête d\'abord v1 : les requêtes échouent.',
      install: 'v2 s\'installe sur la même machine : toujours hors service.',
      newlive: 'v2 tourne. Les utilisateurs ont vu des erreurs pendant l\'échange.',
      bad: 'v2 démarre mais elle est cassée : chaque requête échoue.',
      rollstop: 'Revenir en arrière, c\'est arrêter v2 et réinstaller v1 : encore hors service.',
      rolled: 'v1 est revenue, après deux coupures.',
      deploy: 'Vert (v2) démarre à côté de bleu (v1) ; bleu continue de servir.',
      checkok: 'Vert passe son contrôle de santé pendant que bleu sert encore.',
      checkfail: 'Vert échoue au contrôle de santé. Le trafic n\'a jamais bougé.',
      kept: 'Vert est jeté ; les utilisateurs n\'ont rien vu.',
      switch: 'Le routeur bascule vers vert d\'un seul coup.',
      standby: 'Bleu reste au repos, prêt pour un retour arrière immédiat.',
    } as Record<string, string>,
    failed: 'Requêtes échouées', served: 'Servies',
  },
};

const tone = (u: Up) => (u === 'up' ? 'good' : u === 'broken' || u === 'down' ? 'bad' : 'off');

export default function BlueGreen() {
  return (
    <DiagramFrame
      title={{ en: T.en.title, fr: T.fr.title }}
      practice={{ en: T.en.practice, fr: T.fr.practice }}
      summary={{ en: T.en.summary, fr: T.fr.summary }}
      sim={blueGreen}
      tickMs={1300}
      defaults={{ bug: 0 }}
      controls={[{ key: 'bug', kind: 'check', label: { en: T.en.bug, fr: T.fr.bug } }]}
      caption={({ s, lang }) => T[lang].ev[s.ev]}
      stats={({ s, lang }) => [
        { label: T[lang].failed, value: s.failed, tone: s.failed ? 'bad' : 'good' },
        { label: T[lang].served, value: s.served },
      ]}
      draw={({ s, fix, lang }) => {
        const t = T[lang];
        const f = s.frame;
        const target = f.route === 'a' ? f.a : f.route === 'b' ? f.b : 'down';
        const ok = target === 'up';
        // in place: one slot whose state is whichever version occupies it
        const slot: Up = f.b === 'idle' ? f.a : f.a === 'starting' ? 'starting' : f.b;
        const ty = !fix ? 66 : f.route === 'b' ? 96 : 36;
        const reqs = Array.from({ length: BG.perStep }, (_, i) => i);
        return (
          <svg viewBox="0 0 320 132" className="dg-svg">
            <Box x={6} y={42} w={68} h={48} label={t.router} />
            {fix ? (
              <>
                <Box x={208} y={12} w={106} h={48} label={t.blue} sub={t.st[f.a]} tone={tone(f.a)} />
                <Box x={208} y={72} w={106} h={48} label={t.green} sub={t.st[f.b]} tone={tone(f.b)} />
                <Edge d="M74 60 C140 60 150 36 208 36" run={f.route === 'a' ? s.n : undefined} />
                <Edge d="M74 72 C140 72 150 96 208 96" run={f.route === 'b' ? s.n : undefined} />
              </>
            ) : (
              <>
                <Box x={208} y={42} w={106} h={48} label={t.server} sub={t.inPlace[s.ev]} tone={tone(slot)} />
                <Edge d="M74 66 H208" run={s.n} tone={ok ? undefined : 'bad'} />
              </>
            )}
            {reqs.map((i) => (
              <Tok key={`${s.n}-${i}`} k={`q${s.n}-${i}`} r={4} x={ok ? 188 - i * 9 : 92 + i * 9} y={ty + (ok ? 0 : 30)} from={[40, 66]} className={ok ? 'dg-tok' : 'dg-tok dg-tok--bad'} />
            ))}
          </svg>
        );
      }}
    />
  );
}
