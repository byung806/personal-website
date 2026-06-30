export function Purple({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-gray-900">
      {children}
    </div>
  );
}

export function Red({ children, author }: { children: React.ReactNode; author?: string }) {
  return (
    <div className="mb-3 [&>p]:mb-2 [&>p:last-child]:mb-0" style={{ color: '#be123c' }}>
      {children}
      {author && (
        <p className="mt-2 text-sm font-serif italic" style={{ color: '#be123c', opacity: 0.6 }}>
          — {author}
        </p>
      )}
    </div>
  );
}

export function Blue({ children, author }: { children: React.ReactNode; author?: string }) {
  return (
    <div className="mb-3 [&>p]:mb-2 [&>p:last-child]:mb-0" style={{ color: '#1e40af' }}>
      {children}
      {author && (
        <p className="mt-2 text-sm font-serif italic" style={{ color: '#1e40af', opacity: 0.6 }}>
          — {author}
        </p>
      )}
    </div>
  );
}

export function Legend() {
  return (
    <div className="mb-7 pb-5 border-b border-gray-100 flex items-center gap-4 font-serif text-sm italic">
      <span style={{ color: '#be123c' }}>Cathy</span>
      <span className="text-gray-200 not-italic">·</span>
      <span style={{ color: '#1e40af' }}>Bryan</span>
      <span className="text-gray-200 not-italic">·</span>
      <span
        style={{
          background: 'linear-gradient(90deg, #be123c, #1e40af)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        together
      </span>
    </div>
  );
}
