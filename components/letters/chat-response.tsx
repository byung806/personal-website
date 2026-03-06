'use client';

import { useState, useRef, useEffect } from 'react';

function wrapWordsInSpans(el: HTMLElement, offset: { count: number }) {
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent ?? '';
      if (!text.trim()) continue;
      const frag = document.createDocumentFragment();
      const parts = text.split(/(\s+)/);
      for (const part of parts) {
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
        } else {
          const span = document.createElement('span');
          span.textContent = part;
          span.style.opacity = '0';
          span.style.display = 'inline-block';
          span.dataset.wordIndex = String(offset.count++);
          frag.appendChild(span);
        }
      }
      node.parentNode?.replaceChild(frag, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      wrapWordsInSpans(node as HTMLElement, offset);
    }
  }
}

export default function ChatResponse({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const animKeyRef = useRef(0);

  // Wrap words once on mount
  useEffect(() => {
    if (!contentRef.current || initialized.current) return;
    initialized.current = true;
    wrapWordsInSpans(contentRef.current, { count: 0 });
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const key = ++animKeyRef.current;
    const spans = Array.from(
      contentRef.current.querySelectorAll<HTMLSpanElement>('span[data-word-index]')
    );

    if (!open) {
      spans.forEach(s => { s.style.transition = 'none'; s.style.opacity = '0'; });
      return;
    }

    spans.forEach((s, i) => {
      setTimeout(() => {
        if (animKeyRef.current !== key) return;
        s.style.transition = 'opacity 0.2s ease';
        s.style.opacity = '1';
      }, i * 55);
    });
  }, [open]);

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="font-serif italic text-gray-400 text-sm hover:text-gray-600 transition-colors cursor-pointer"
      >
        {open ? 'hide response ↑' : "read ChatGPT's response ↓"}
      </button>

      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? '9999px' : '0px' }}
      >
        <div className="mt-4 border border-gray-200 rounded-lg px-7 py-6">
          <div ref={contentRef} className="font-serif text-gray-500 text-base leading-[1.85] [&>p]:mb-5 [&>p:last-child]:mb-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
