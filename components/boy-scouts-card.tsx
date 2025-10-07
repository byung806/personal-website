'use client';

import { ArrowUpRight } from 'lucide-react';

export default function BoyScoutsCard() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-heading font-semibold text-text mb-4">Boy Scouts App</h3>
      
      <div className="flex-1 flex flex-col justify-between">
        {/* Project Visual */}
        <div className="relative bg-gradient-to-br from-green-500 to-blue-500 rounded-xl overflow-hidden mb-4">
          <div className="p-4 text-white text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <span className="text-xl">🏕️</span>
            </div>
            <h4 className="font-semibold text-sm">Scout Tracker</h4>
          </div>
        </div>
        
        {/* Project Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-brand/10 text-brand text-xs rounded-full">Flutter</span>
            <span className="px-2 py-1 bg-brand/10 text-brand text-xs rounded-full">Firebase</span>
          </div>
          
          <p className="text-subtext text-sm">
            Practical app for tracking scout activities and achievements.
          </p>
          
          <button className="w-full h-10 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center gap-2 text-sm">
            <span>View project</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
