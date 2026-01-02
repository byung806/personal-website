import Link from 'next/link';

interface SiteTitleProps {
  isPlaceholder?: boolean;
  isHome?: boolean;
}

export default function SiteTitle({ isPlaceholder = false, isHome = false }: SiteTitleProps) {
  if (isPlaceholder) {
    return (
      <span className="inline-flex items-center pointer-events-none select-none">
        <span className="font-wordmark font-bold mr-1">Bryan</span>
        <span className="font-wordmark font-bold ml-1">Yung</span>
      </span>
    );
  }
  
  const titleContent = (
    <span className="inline-flex items-center">
      <span className="font-wordmark font-bold mr-1">Bryan</span>
      <span className="font-wordmark font-bold ml-1">Yung</span>
    </span>
  );

  if (isHome) {
    return (
      <div className="font-serif text-2xl text-gray-900 dark:text-gray-100 inline-flex items-center">
        {titleContent}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center">
      <Link href="/" className="font-serif text-2xl text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity inline-flex items-center">
        {titleContent}
      </Link>
    </div>
  );
}
