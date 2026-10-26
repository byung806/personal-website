/** Self-evaluation scores on /days run 1..100 (0 is never stored, so a logged day never looks empty). */
export const MIN_SCORE = 1;
export const MAX_SCORE = 100;

/** Low days sink to deep indigo, good days burn through magenta and coral to gold. */
const STOPS: [number, [number, number, number]][] = [
  [0, [44, 36, 112]],
  [0.3, [104, 64, 220]],
  [0.55, [205, 64, 184]],
  [0.8, [255, 106, 92]],
  [1, [255, 214, 110]],
];

export function scoreColor(score: number, alpha = 1) {
  const t = Math.min(1, Math.max(0, (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE)));
  let i = 1;
  while (i < STOPS.length - 1 && STOPS[i][0] < t) i++;
  const [t0, c0] = STOPS[i - 1];
  const [t1, c1] = STOPS[i];
  const k = (t - t0) / (t1 - t0);
  const [r, g, b] = c0.map((c, j) => Math.round(c + (c1[j] - c) * k));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** The viewer's local calendar day as YYYY-MM-DD. */
export function dayKey(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}
