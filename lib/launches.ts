import type { ShipKind } from '@/components/launchpad/paint';

/**
 * What can be launched from the /play launchpad. Add a kind here (and teach
 * `paintShip` to draw it) to add an easter egg ship; the database stores kinds as plain strings.
 */
export const LAUNCH_KINDS: readonly ShipKind[] = ['rocket', 'ufo', 'satellite'];

/** Pencil colors for ship bodies, picked to sit in the night scene (see paint.ts). */
export const SHIP_COLORS = ['#f0dfd2', '#d9939c', '#e6a27e', '#9fb3d8', '#b9a3d6', '#e8c98f'];

/** How many launches fly in the sky banner, so it never gets crowded. */
export const SKY_LAUNCHES = 4;

export type Launch = { id: number; kind: ShipKind; color: string; createdAt: string };

export type LaunchStats = {
  total: number;
  counts: Record<string, number>;
  /** A spread of launches from all of history (see `pickSpread`), oldest first. */
  sky: Launch[];
};

/**
 * Picks `n` of `ids` (oldest first) so their ages vary a lot: splits the list into `n` equal slices
 * of history and takes one at random from each.
 */
export function pickSpread(ids: number[], n: number) {
  if (ids.length <= n) return ids;
  return Array.from({ length: n }, (_, i) => {
    const from = Math.floor((i * ids.length) / n);
    const to = Math.floor(((i + 1) * ids.length) / n);
    return ids[from + Math.floor(Math.random() * (to - from))];
  });
}
