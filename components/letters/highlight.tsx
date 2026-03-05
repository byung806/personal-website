export default function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ color: '#81cc3e' }} className="font-semibold">
      {children}
    </span>
  );
}
