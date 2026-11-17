import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

// word id -> diagram, each its own chunk. Loaded only from a word page that has a diagram (see index.tsx).
const REG: Record<string, LazyExoticComponent<ComponentType>> = {
  'backpressure': lazy(() => import('./Backpressure')),
  'circuit-breaker': lazy(() => import('./CircuitBreaker')),
  'backoff-jitter': lazy(() => import('./BackoffJitter')),
  'race-condition': lazy(() => import('./RaceCondition')),
  'idempotent': lazy(() => import('./Idempotent')),
  'blue-green': lazy(() => import('./BlueGreen')),
  'fan-out-fan-in': lazy(() => import('./FanOut')),
  'eventual-consistency': lazy(() => import('./EventualConsistency')),
  'rate-limit': lazy(() => import('./RateLimit')),
  'single-flight': lazy(() => import('./SingleFlight')),
};

export const REGISTRY_IDS = Object.keys(REG);

export default function Registry({ id }: { id: string }) {
  const C = Object.hasOwn(REG, id) ? REG[id] : undefined;
  return C ? <C /> : null;
}
