// Soft pastel bokeh on cream. Place inside a `relative` container; content above it needs `relative z-[1]`.
const BLOBS = [
  { left: '8vw', top: '10vh', blur: '30vmin', spread: '16vmin', color: '#ffd6e0' },
  { left: '78vw', top: '6vh', blur: '34vmin', spread: '18vmin', color: '#d7f2c2' },
  { left: '85vw', top: '55vh', blur: '32vmin', spread: '18vmin', color: '#fff1b8' },
  { left: '6vw', top: '60vh', blur: '34vmin', spread: '18vmin', color: '#cfe8ff' },
  { left: '45vw', top: '85vh', blur: '30vmin', spread: '16vmin', color: '#ffd6e0' },
  { left: '38vw', top: '3vh', blur: '26vmin', spread: '14vmin', color: '#d7f2c2' },
];

export default function BokehBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#fdf6ea]">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute w-px h-px rounded-full"
          style={{ left: b.left, top: b.top, boxShadow: `0 0 ${b.blur} ${b.spread} ${b.color}` }}
        />
      ))}
    </div>
  );
}
