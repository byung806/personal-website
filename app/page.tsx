'use client';

import { useState } from 'react';
import NavPills from '@/components/nav-pills';
import BentoGrid from '@/components/bento-grid';
import { cards, initialOrder } from '@/content/cards';

const tabs = ['All', 'About', 'Projects', 'Play'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('All');

  const sortedCards = [...cards].sort((a, b) => {
    if (activeTab === 'All') {
      return initialOrder.indexOf(a.id) - initialOrder.indexOf(b.id);
    }
    
    const scoreA = a.tags.includes(activeTab as any) ? 0 : 1;
    const scoreB = b.tags.includes(activeTab as any) ? 0 : 1;
    
    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }
    
    return initialOrder.indexOf(a.id) - initialOrder.indexOf(b.id);
  });

  return (
    <main className="min-h-screen bg-bg">
      {/* Add spacing above nav pills */}
      <div className="pt-8 lg:pt-12">
        <NavPills 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
      <BentoGrid cards={sortedCards} />
    </main>
  );
}