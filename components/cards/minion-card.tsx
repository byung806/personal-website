'use client';

import ProjectCard from '../project-card';

const messages = [
  { from: 'me', text: 'remind me to submit the problem set tmrw night' },
  { from: 'minion', text: 'got it, I’ll text you at 8pm tomorrow' },
  { from: 'minion', text: 'also, the deadline moved to Friday per the course email' },
];

export default function MinionCard() {
  return (
    <ProjectCard projectId="minion">
      <div className="relative w-full min-h-[300px] md:min-h-[360px] p-8 md:p-10 flex items-center justify-center">
        <div className="w-full max-w-[280px] flex flex-col gap-2 font-sans text-[13px] leading-snug">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] px-3.5 py-2 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.06)] ${
                m.from === 'me'
                  ? 'self-end bg-[#0a84ff] text-white rounded-br-md'
                  : 'self-start bg-white text-gray-900 rounded-bl-md'
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      </div>
    </ProjectCard>
  );
}
