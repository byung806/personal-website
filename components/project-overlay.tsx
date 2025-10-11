'use client';

import { ArrowUpRight } from 'lucide-react';

interface ProjectOverlayProps {
    title: string;
    tags: string[];
    href: string;
    icon: React.ReactNode;
    isHovered: boolean;
    clickable?: boolean;
}

export default function ProjectOverlay({
    title,
    tags,
    href,
    icon,
    isHovered,
    clickable = true
}: ProjectOverlayProps) {
    const handleClick = (e: React.MouseEvent) => {
        if (!clickable) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <div className="relative h-full z-10 flex flex-col">
            {/* Top right corner - stacked tags */}
            <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
                {tags.map((tag, index) => {
                    const colors = [
                        'bg-blue-500 text-white',
                        'bg-purple-500 text-white',
                        'bg-green-500 text-white',
                        'bg-orange-500 text-white',
                        'bg-pink-500 text-white',
                    ];
                    return (
                        <span
                            key={index}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-full shadow-lg whitespace-nowrap ${colors[index % colors.length]}`}
                        >
                            {tag}
                        </span>
                    );
                })}
            </div>

            {/* Bottom section */}
            <div className="mt-auto">
                {/* Footer with project title */}
                <div className="bg-black/20 backdrop-blur-sm px-6 py-4">
                    <h3 className="text-white text-base font-semibold mb-3">
                        {title}
                    </h3>

                    {/* Hover link */}
                    {clickable ? (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center transition-all duration-500 ease-out bg-white shadow-lg ${isHovered
                                ? 'w-full h-10 rounded-full px-4'
                                : 'w-10 h-10 rounded-full'
                                }`}
                        >
                            {isHovered ? (
                                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm whitespace-nowrap">
                                    <span className="animate-fade-in">View Project</span>
                                    <ArrowUpRight className="w-4 h-4 animate-fade-in" />
                                </div>
                            ) : (
                                <div className="text-gray-900">
                                    {icon}
                                </div>
                            )}
                        </a>
                    ) : (
                        <div
                            className={`inline-flex items-center justify-center transition-all duration-500 ease-out pointer-events-none bg-white shadow-lg ${isHovered
                                ? 'w-full h-10 rounded-full px-4'
                                : 'w-10 h-10 rounded-full'
                                }`}
                            onClick={handleClick}
                        >
                            {isHovered ? (
                                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm whitespace-nowrap">
                                    <span className="animate-fade-in">View Project</span>
                                    <ArrowUpRight className="w-4 h-4 animate-fade-in" />
                                </div>
                            ) : (
                                <div className="text-gray-900">
                                    {icon}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
