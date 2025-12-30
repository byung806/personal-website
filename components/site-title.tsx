import Link from 'next/link';

interface SiteTitleProps {
  isPlaceholder?: boolean;
}

export default function SiteTitle({ isPlaceholder = false }: SiteTitleProps) {
  if (isPlaceholder) {
    return (
      <span className="inline-flex items-center pointer-events-none select-none">
        <span className="font-wordmark font-bold mr-1">Bryan</span>
        <span className="font-wordmark font-bold ml-1">Yung</span>
      </span>
    );
  }
  return (
    <div className="inline-flex items-center">
      <Link href="/" className="font-serif text-2xl text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity inline-flex items-center">
        <span className="font-wordmark font-bold mr-1">Bryan</span>
        <span className="font-wordmark font-bold ml-1">Yung</span>
      </Link>
    </div>
  );
}
