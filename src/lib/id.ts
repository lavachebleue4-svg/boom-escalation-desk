let counter = 0;

/** Deterministic-enough id generator for a client-only demo (no backend). */
export function makeId(prefix = 'id'): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}
