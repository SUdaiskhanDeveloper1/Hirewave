/** Deterministic PRNG + sampling helpers so every build produces the same dataset. */

/** mulberry32 — tiny, fast, good enough for fixtures. */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Non-empty array access that satisfies `noUncheckedIndexedAccess`. */
export function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] as T;
}

export function pickN<T>(items: readonly T[], count: number, random: () => number): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i += 1) {
    const index = Math.floor(random() * pool.length);
    out.push(pool.splice(index, 1)[0] as T);
  }
  return out;
}

export function intBetween(min: number, max: number, random: () => number): number {
  return min + Math.floor(random() * (max - min + 1));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
