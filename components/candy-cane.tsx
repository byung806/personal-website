export default function CandyCane() {
  return (
    <>
      {/* Festive full-width bottom border */}
      <div
        aria-hidden="true"
        className="h-[10px] w-full"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, #fb7185 0px 17px, #fcfafa 17px 30px, #60a5fa 30px 47px, #fcfafa 47px 60px)',
        }}
      />
      
      {/* Downward glow effect - positioned at bottom of entire section */}
      {/* <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          height: '48px',
          background: `
            linear-gradient(to bottom,
              rgba(251, 113, 133, 0.4) 0%,
              rgba(96, 165, 250, 0.35) 20%,
              rgba(251, 113, 133, 0.25) 40%,
              rgba(96, 165, 250, 0.2) 60%,
              rgba(251, 113, 133, 0.1) 80%,
              transparent 100%
            )
          `,
          filter: 'blur(12px)',
          transform: 'translateY(100%)',
        }}
      /> */}
    </>
  );
}

