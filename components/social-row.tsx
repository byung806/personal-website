'use client';

import { Download, Github, Linkedin, Mail } from 'lucide-react';

export default function SocialRow() {
  return (
    <div className="flex items-center gap-3 mt-6">
      <a
        href="/Bryan_Yung_Resume.pdf"
        download
        className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center group"
        aria-label="Download Resume"
      >
        <Download className="w-5 h-5 text-text group-hover:text-brand transition-colors" />
      </a>
      <a
        href="https://github.com/byung806/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center group"
        aria-label="GitHub"
      >
        <Github className="w-5 h-5 text-text group-hover:text-brand transition-colors" />
      </a>
      <a
        href="https://www.linkedin.com/in/bryan-yung-9724952b9/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center group"
        aria-label="LinkedIn"
      >
        <Linkedin className="w-5 h-5 text-text group-hover:text-brand transition-colors" />
      </a>
      <a
        href="mailto:byung806@gmail.com"
        className="w-10 h-10 rounded-full border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center group"
        aria-label="Email"
      >
        <Mail className="w-5 h-5 text-text group-hover:text-brand transition-colors" />
      </a>
    </div>
  );
}