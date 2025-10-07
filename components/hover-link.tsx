'use client';

import { ArrowUpRight } from 'lucide-react';

interface HoverLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isHovered: boolean;
  className?: string;
  clickable?: boolean;
}

export default function HoverLink({ 
  href, 
  icon, 
  text, 
  isHovered, 
  className = '',
  clickable = true
}: HoverLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (!clickable) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div className={`relative h-full z-10 flex flex-col justify-between p-6 ${className}`}>
      <div className="flex"></div>
      {clickable ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center transition-all duration-500 ease-out ${
            isHovered 
              ? 'w-full h-10 bg-black rounded-full px-4' 
              : 'w-10 h-10 bg-black rounded-full'
          }`}
        >
          {isHovered ? (
            <div className="flex items-center gap-2 text-white font-medium text-sm whitespace-nowrap">
              <span className="animate-fade-in">{text}</span>
              <ArrowUpRight className="w-4 h-4 animate-fade-in" />
            </div>
          ) : (
            <div className="text-white">
              {icon}
            </div>
          )}
        </a>
      ) : (
        <div 
          className={`inline-flex items-center justify-center transition-all duration-500 ease-out pointer-events-none ${
            isHovered 
              ? 'w-full h-10 bg-black rounded-full px-4' 
              : 'w-10 h-10 bg-black rounded-full'
          }`}
          onClick={handleClick}
        >
          {isHovered ? (
            <div className="flex items-center gap-2 text-white font-medium text-sm whitespace-nowrap">
              <span className="animate-fade-in">{text}</span>
              <ArrowUpRight className="w-4 h-4 animate-fade-in" />
            </div>
          ) : (
            <div className="text-white">
              {icon}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
