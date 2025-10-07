'use client';

import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react';

export default function ContactCard() {
  return (
    <div className="h-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-6 left-6 w-16 h-16 rounded-full bg-white/20"></div>
        <div className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-white/10"></div>
      </div>
      
      <div className="relative z-10 h-full flex flex-col justify-center text-center p-6">
        <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-4 flex items-center justify-center">
          <MessageCircle className="w-6 h-6" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">Say Hi</h3>
        <p className="text-white/80 text-sm mb-6">
          Let's build something amazing together
        </p>
        
        <button className="w-full h-12 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors flex items-center justify-center gap-2 font-medium">
          <Mail className="w-4 h-4" />
          <span>Get in touch</span>
        </button>
        
        <div className="text-xs text-white/60 mt-4">
          <p>bryan@example.com</p>
          <p>Available for freelance</p>
        </div>
      </div>
    </div>
  );
}
