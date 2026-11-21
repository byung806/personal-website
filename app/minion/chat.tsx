'use client';

import { useEffect, useRef, useState } from 'react';
import { LockKeyhole, LogOut, ArrowUp, RotateCcw, Workflow } from 'lucide-react';
import { GlassButton, GlassCard } from '@zakisheriff/liquid-glass';
import '@zakisheriff/liquid-glass/styles.css';
import './minion.css';
import ActivityPanel from './activity-panel';

type Message = { id: string; cursor?: number; direction: 'in' | 'out'; text: string; at: number;
  job?: string; action?: string; pending?: 'sending' | 'queued' | 'failed' };
const time = (at: number) => new Date(at * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

function MessageText({ text }: { text: string }) {
  return <>{text.split(/(https?:\/\/[^\s<>]+)/g).map((part, i) => /^https?:\/\//.test(part)
    ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a> : part)}</>;
}

export default function Chat() {
  const [activityOpen, setActivityOpen] = useState(false);
  const [inspectJob, setInspectJob] = useState('');
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [unlocking, setUnlocking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [working, setWorking] = useState(false);
  const [latestState, setLatestState] = useState('');
  const cursor = useRef(0);
  const scroll = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const stick = useRef(true);
  const generation = useRef(0);

  useEffect(() => {
    if (authenticated === false) return;
    let alive = true;
    let timer: ReturnType<typeof setTimeout>;
    const abort = new AbortController();
    let polling = false;
    async function poll() {
      if (polling || !alive) return;
      polling = true;
      let delay = 1200;
      try {
        const response = await fetch(`/api/minion/messages?after=${cursor.current}`, { cache: 'no-store', signal: abort.signal });
        if (!alive) return;
        if (response.status === 401) { setAuthenticated(false); setMessages([]); cursor.current = 0; return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Connection interrupted.');
        cursor.current = data.cursor;
        setMessages(previous => {
          const merged = new Map(previous.map(m => [m.id, m]));
          data.messages.forEach((m: Message) => merged.set(m.id, m));
          return Array.from(merged.values()).sort((a, b) => a.at - b.at);
        });
        setAuthenticated(true); setConnected(true); setWorking(data.jobs.length > 0);
        setLatestState(data.latest_state || '');
        delay = data.jobs.length ? 1000 : 3000;
      } catch (e) {
        if (!alive) return;
        setConnected(false); delay = 5000;
        if (authenticated === null) { setAuthenticated(false); setError('Could not connect to Minion. Try signing in again shortly.'); }
      } finally { polling = false; }
      if (alive) timer = setTimeout(poll, document.hidden ? 10000 : delay);
    }
    poll();
    const refresh = () => { if (!document.hidden) { clearTimeout(timer); poll(); } };
    document.addEventListener('visibilitychange', refresh);
    return () => { alive = false; abort.abort(); clearTimeout(timer); document.removeEventListener('visibilitychange', refresh); };
  }, [authenticated]);

  useEffect(() => {
    if (stick.current) scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' });
  }, [messages, working]);
  useEffect(() => {
    if (input.current) { input.current.style.height = 'auto'; input.current.style.height = `${Math.min(input.current.scrollHeight, 160)}px`; }
  }, [text]);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setUnlocking(true); setError('');
    try {
      const response = await fetch('/api/minion/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pattern }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPattern([]); cursor.current = 0; setAuthenticated(true);
    } catch (e) { setPattern([]); setError(e instanceof Error ? e.message : 'Could not sign in.'); }
    finally { setUnlocking(false); }
  }

  async function send(message?: Message) {
    if (!message && !text.trim()) return;
    const id = message?.id || `in:web:${crypto.randomUUID()}`;
    const outgoing: Message = { id, direction: 'in', text: message?.text || text.trim(), at: message?.at || Date.now() / 1000, pending: 'sending' };
    const currentGeneration = generation.current;
    if (!message) setText('');
    setError(''); stick.current = true;
    setMessages(previous => [...previous.filter(m => m.id !== id), outgoing]);
    input.current?.focus();
    try {
      const response = await fetch('/api/minion/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id.replace('in:web:', ''), text: outgoing.text }) });
      const data = await response.json();
      if (currentGeneration !== generation.current) return;
      if (!response.ok) throw new Error(data.error || 'Message could not be sent.');
      setWorking(true);
      setMessages(previous => previous.map(m => m.id === id && m.pending ? { ...m, pending: 'queued' } : m));
    } catch (e) {
      if (currentGeneration !== generation.current) return;
      setMessages(previous => previous.map(m => m.id === id ? { ...m, pending: 'failed' } : m));
      setError(e instanceof Error ? e.message : 'Connection interrupted. Retry your message below.');
    }
  }

  async function logout() {
    try {
      const response = await fetch('/api/minion/logout', { method: 'POST' });
      if (!response.ok) throw new Error();
      generation.current++; setMessages([]); setText(''); cursor.current = 0; setAuthenticated(false); setError('');
    } catch { setError('Could not sign out. Please try again.'); }
  }

  if (authenticated !== true) return <main data-theme="light" className="minion-shell minion-lock">
    <GlassCard className="minion-login-surface" padding="26px" radius="30px" intensity={3}>
    <form onSubmit={login} className="minion-login">
      <div className="minion-wordmark"><span className="minion-mark">m</span>minion<span className="minion-private"><LockKeyhole size={13} /> private</span></div>
      <h1>Sign in.</h1><p>Continue your conversation with Minion.</p>
      {authenticated === null ? <p role="status">{connected ? 'Opening your conversation…' : 'Connecting…'}</p> : <>
        <p className="minion-pattern-hint" id="pattern-help">Tap your pattern in order.</p>
        <div className="minion-pattern" role="group" aria-label="Unlock pattern" aria-describedby="pattern-help">
          <svg viewBox="0 0 270 270" aria-hidden="true"><polyline points={pattern.map(dot => `${45 + dot % 3 * 90},${45 + Math.floor(dot / 3) * 90}`).join(' ')} /></svg>
          {['Top left', 'Top center', 'Top right', 'Middle left', 'Center', 'Middle right', 'Bottom left', 'Bottom center', 'Bottom right'].map((label, dot) => <button
            key={label} type="button" aria-label={label} aria-pressed={pattern.includes(dot)} disabled={unlocking}
            onClick={() => { if (!pattern.includes(dot)) { setPattern([...pattern, dot]); setError(''); } }}>
            <span>{pattern.includes(dot) ? pattern.indexOf(dot) + 1 : ''}</span>
          </button>)}
        </div>
        <div className="minion-pattern-actions"><button type="button" disabled={!pattern.length || unlocking} onClick={() => { setPattern([]); setError(''); }}>Clear</button>
          <span role="status">{unlocking ? 'Checking…' : `${pattern.length} selected`}</span></div>
        <GlassButton type="submit" variant="filled" tint="#007aff" className="minion-unlock" disabled={unlocking || pattern.length < 3}>{unlocking ? 'Opening…' : 'Open Minion'}</GlassButton>
        <small>Only you. This browser stays signed in for 30 days.</small>
      </>}
      {error && <p className="minion-error" role="alert">{error}</p>}
    </form></GlassCard>
  </main>;

  return <main data-theme="light" className="minion-shell">
    <GlassCard className="minion-toolbar-surface" padding="0" radius="24px" intensity={3}><header className="minion-header"><div className="minion-wordmark"><span className="minion-mark">m</span>minion</div>
      <div className="minion-connection" role="status"><span className={connected ? 'online' : ''} />{connected ? 'Connected' : 'Reconnecting…'}</div>
      <GlassButton size="sm" variant="tinted" className={`minion-debug-toggle ${activityOpen ? 'selected' : ''}`} onClick={() => setActivityOpen(!activityOpen)} aria-pressed={activityOpen} title="Live activity" aria-label="Activity" icon={<Workflow size={18} />}><span>Activity</span></GlassButton>
      <GlassButton size="sm" variant="clear" className="minion-logout" onClick={logout} aria-label="Sign out" title="Sign out" icon={<LogOut size={17} />} />
    </header></GlassCard>
    <div className={`minion-workspace ${activityOpen ? 'activity-visible' : ''}`}><div className="minion-chat-column">
    <div className="minion-timeline" ref={scroll} onScroll={() => { const el = scroll.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 100; }}>
      <div className="minion-conversation" role="log" aria-label="Conversation">
        <div className="minion-history-label">Your conversation</div>
        {!messages.length && <div className="minion-empty">Hey, Bryan.<br /><span>What are we doing today?</span></div>}
        {messages.map((message, i) => {
          const date = new Date(message.at * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' });
          const showDate = i === 0 || new Date(messages[i - 1].at * 1000).toDateString() !== new Date(message.at * 1000).toDateString();
          return <div key={message.id}>
            {showDate && <div className="minion-date">{date}</div>}
            <article className={`minion-message ${message.direction === 'in' ? 'from-you' : 'from-minion'}`}>
              {message.direction === 'out' && <span className="minion-avatar" aria-label="Minion">m</span>}
              <div className="minion-message-content"><div className="minion-bubble"><MessageText text={message.text} /></div>
                <div className="minion-message-meta"><time dateTime={new Date(message.at * 1000).toISOString()}>{time(message.at)}</time>
                  {message.direction === 'in' && message.job && <button className="minion-inspect" aria-label="Inspect request" title="Inspect request" onClick={() => { setInspectJob(message.job!); setActivityOpen(true); }}><Workflow size={13} /></button>}
                  {message.pending === 'sending'  && ' · Sending…'}{message.pending === 'queued' && ' · Received'}
                  {message.pending === 'failed' && <button onClick={() => send(message)}><RotateCcw size={12} /> Retry</button>}
                </div>
              </div>
            </article>
          </div>;
        })}
        {working && <div className="minion-working" role="status"><span className="minion-avatar">m</span><span className="thinking-dots"><i /><i /><i /></span><span>Working</span></div>}
        {!working && ['failed', 'uncertain'].includes(latestState) && <p className="minion-error">The last request didn’t finish. Send a follow-up to check where it stopped.</p>}
      </div>
    </div>
    <footer className="minion-composer-wrap"><form className="minion-compose-form" onSubmit={e => { e.preventDefault(); send(); }}><GlassCard className="minion-composer" padding="6px 7px 6px 16px" radius="26px" intensity={3}>
      <label className="sr-only" htmlFor="minion-message">Message Minion</label>
      <textarea id="minion-message" ref={input} value={text} onChange={e => setText(e.target.value)} placeholder="Message Minion…" rows={1} maxLength={8000}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
      <GlassButton size="sm" variant="filled" tint="#007aff" type="submit" aria-label="Send message" disabled={!text.trim()} icon={<ArrowUp size={21} strokeWidth={3} />} />
    </GlassCard></form>{error && <p className="minion-error" role="alert">{error}</p>}
      <div className="minion-composer-note"><LockKeyhole size={11} /> Private conversation<span>Enter to send · Shift + Enter for a new line</span></div>
    </footer>
    </div>{activityOpen && <ActivityPanel job={inspectJob} onJob={setInspectJob} onClose={() => setActivityOpen(false)} onExpired={() => { setAuthenticated(false); setMessages([]); }} />}</div>
  </main>;
}
