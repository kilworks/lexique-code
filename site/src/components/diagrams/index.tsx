import { lazy, Suspense } from 'react';

// Only this list ships with the word page; the registry and each diagram load on demand.
// shortcut: keyed by word id because enrich/ and build-data.mjs were out of this change's reach; move to an enrich "diagram" field once the build validates it.
export const DIAGRAM_IDS = ['backpressure', 'circuit-breaker', 'backoff-jitter', 'race-condition', 'idempotent', 'blue-green', 'fan-out-fan-in', 'eventual-consistency', 'rate-limit', 'single-flight'];

const Registry = lazy(() => import('./Registry'));

export function Diagram({ id }: { id: string }) {
  if (!DIAGRAM_IDS.includes(id)) return null;
  return (
    <Suspense fallback={<div className="word__diagram-wait" aria-hidden="true" />}>
      <Registry id={id} />
    </Suspense>
  );
}
