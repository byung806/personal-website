/**
 * A rocket built in the /play launchpad's builder: one pick per part, stored with the guestbook entry
 * as a short code like "2.0.1.3.4.1" (nose.body.fins.window.paint.trim). Painted by `paintRocket`
 * in components/launchpad/rocket-paint.ts.
 */

export const NOSES = ['cone', 'dome', 'needle', 'capsule'] as const;
export const BODIES = ['classic', 'chubby', 'slim', 'bullet'] as const;
export const FINS = ['triangle', 'swept', 'round', 'trio'] as const;
export const WINDOWS = ['porthole', 'double', 'stripe', 'star'] as const;

/** Pencil colors for the body, picked to sit in the night scene. */
export const PAINTS = ['#f0dfd2', '#d9939c', '#e6a27e', '#9fb3d8', '#b9a3d6', '#e8c98f', '#9fd3c0', '#f4f1f8'];
/** Darker colors for the nose and fins. */
export const TRIMS = ['#6f3446', '#2f4a7a', '#b84a3a', '#2f6656', '#5b3f99', '#b0802c'];

export type RocketDesign = { nose: number; body: number; fins: number; window: number; paint: number; trim: number };

/** How many choices each part has, in code order. */
const SIZES: [keyof RocketDesign, number][] = [
  ['nose', NOSES.length],
  ['body', BODIES.length],
  ['fins', FINS.length],
  ['window', WINDOWS.length],
  ['paint', PAINTS.length],
  ['trim', TRIMS.length],
];

export const encodeRocket = (d: RocketDesign) => SIZES.map(([k]) => d[k]).join('.');

/** The design in `code`, or null if it isn't a valid one. */
export function decodeRocket(code?: string | null): RocketDesign | null {
  const parts = code?.split('.').map(Number);
  if (!parts || parts.length !== SIZES.length) return null;
  if (parts.some((v, i) => !Number.isInteger(v) || v < 0 || v >= SIZES[i][1])) return null;
  return Object.fromEntries(SIZES.map(([k], i) => [k, parts[i]])) as RocketDesign;
}

/** A random design; pass a seeded `rand` for a stable one. */
export function randomRocket(rand: () => number = Math.random): RocketDesign {
  return Object.fromEntries(SIZES.map(([k, n]) => [k, Math.floor(rand() * n)])) as RocketDesign;
}
