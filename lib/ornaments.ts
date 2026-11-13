/** Ornaments a visitor can hang on the /play Christmas tree (components/fun/ascii-tree.tsx draws each one). */
export const ORNAMENTS = [
  { id: 'red', label: 'red ornament', glyph: '+', swatch: '#ff3b4a' },
  { id: 'gold', label: 'gold star', glyph: '*', swatch: '#ffd23f' },
  { id: 'silver', label: 'silver ornament', glyph: '#', swatch: '#e3e9f0' },
  { id: 'blue', label: 'blue ornament', glyph: '@', swatch: '#4f8dff' },
  { id: 'pink', label: 'pink ornament', glyph: '%', swatch: '#ff6fae' },
  { id: 'purple', label: 'purple bell', glyph: '&', swatch: '#9b7bff' },
] as const;

export type OrnamentKind = (typeof ORNAMENTS)[number]['id'];
export const ORNAMENT_KINDS: readonly string[] = ORNAMENTS.map((o) => o.id);

/** An ornament on the tree: `height` from the base (0) to the tip (1), `angle` around the trunk in radians. */
export type HungOrnament = { id: number; username: string; wish: string | null; kind: string; height: number; angle: number; createdAt: string };

export const NAME_MAX = 40;
export const WISH_MAX = 140;
