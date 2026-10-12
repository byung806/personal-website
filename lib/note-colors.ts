/**
 * Colors a visitor can pick for their guestbook note, after The Unsent Project
 * (theunsentproject.com), where each message's color is chosen by whoever wrote it.
 */
export const NOTE_COLORS = [
  '#e4572e', '#f39237', '#f6d743', '#a8c256', '#2e8b57', '#33b5c4',
  '#2f55a4', '#6c4ab6', '#c84b9e', '#f4a6c1', '#8d6e63', '#222222',
];

/** The note's color, or a stable pick for older notes saved before colors existed. */
export function noteColor(id: number, color?: string | null) {
  return color && NOTE_COLORS.includes(color) ? color : NOTE_COLORS[(id * 7) % NOTE_COLORS.length];
}

/** Black or white text, whichever reads better on `hex`. */
export function inkOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55 ? '#111111' : '#ffffff';
}
