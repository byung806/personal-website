'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';

export default function GuestbookCard() {
  const [messages] = useState([
    { id: 1, name: "sarah", message: "love your work", likes: 12 },
    { id: 2, name: "Alex", message: "awesome", likes: 8 },
    { id: 3, name: "Jordan", message: "inspiring projects", likes: 15 },
    { id: 4, name: "Maya", message: "hi", likes: 23 },
    { id: 5, name: "Chris", message: "Great design choices!", likes: 7 },
    { id: 6, name: "Emma", message: "Love the animations", likes: 19 },
  ]);

  const [inputValue, setInputValue] = useState('');

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* Top bar with title */}
      <div className="px-6 py-4 border-b bg-[#febe26] border-gray-100 flex items-center">
        <h3 className="text-sm font-medium text-gray-900">Guestbook</h3>
      </div>

      {/* Messages container */}
      <div className="flex-1 flex flex-col p-6 pt-4">
        {/* Fade overlay at top */}
        <div className="absolute top-16 left-0 right-0 w-full h-6 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>

        {/* Messages - Scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 mb-4 pt-2">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 text-sm">{msg.name}</span>
                <span className="text-gray-600 text-sm">{msg.message}</span>
              </div>
              <button className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="w-3 h-3" />
                <span className="text-xs">{msg.likes}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Add to guestbook input */}
        <div className="mt-auto">
          <input
            type="text"
            placeholder="Add to guestbook"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full px-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full placeholder-gray-400 text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
}
