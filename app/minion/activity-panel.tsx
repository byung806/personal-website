'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Cpu, Wrench, Clock3, GitBranch, Check, Circle, MessageCircle, Radio } from 'lucide-react';
import { GlassButton, GlassCard } from '@zakisheriff/liquid-glass';
import './activity.css';

type Node = { id: string; label: string; kind: string; state: string; at?: number; end?: number; details: Record<string, unknown> };
type Edge = { from: string; to: string; taken: boolean; label?: string };
type Graph = { id: string; label: string; state: string; nodes: Node[]; edges: Edge[] };
type Snapshot = { selected: string | null; state: string; live?: boolean; at: number; limited?: boolean; nodes: Node[]; edges: Edge[]; workflows: Graph[];
  requests: { id: string; label: string; state: string; created: number }[] };
const running = (state: string) => ['running', 'active', 'queued'].includes(state);
const icon = (kind: string) => kind === 'tool' || kind === 'action' ? Wrench : kind === 'model' || kind === 'reason' ? Cpu : kind === 'wait' ? Clock3 : kind === 'reply' ? MessageCircle : GitBranch;
const readable = (state: string) => state.replaceAll('_', ' ');

function ExecutionGraph({ graph, selected, onSelect }: { graph: Graph; selected: string; onSelect: (n: Node) => void }) {
  const layout = useMemo(() => {
    const depths = new Map<string, number>();
    const known = new Set(graph.nodes.map(n => n.id));
    const edges = graph.edges.filter(e => known.has(e.from) && known.has(e.to));
    const incoming = new Map(graph.nodes.map(n => [n.id, 0]));
    const outgoing = new Map<string, string[]>();
    edges.forEach(e => { incoming.set(e.to, incoming.get(e.to)! + 1); outgoing.set(e.from, [...outgoing.get(e.from) || [], e.to]); });
    const queue = graph.nodes.filter(n => incoming.get(n.id) === 0).map(n => n.id);
    for (let i = 0; i < queue.length; i++) {
      const id = queue[i];
      depths.set(id, depths.get(id) || 0);
      for (const next of outgoing.get(id) || []) {
        depths.set(next, Math.max(depths.get(next) || 0, depths.get(id)! + 1));
        incoming.set(next, incoming.get(next)! - 1);
        if (incoming.get(next) === 0) queue.push(next);
      }
    }
    const rows = new Map<number, Node[]>();
    for (const n of graph.nodes) { const depth = depths.get(n.id) || 0; rows.set(depth, [...rows.get(depth) || [], n]); }
    const columns = Math.max(1, ...Array.from(rows.values()).map(r => r.length));
    const width = Math.max(330, columns * 202 + 20);
    const positions = new Map<string, { x: number; y: number }>();
    for (const [depth, nodes] of Array.from(rows.entries())) nodes.forEach((n, i) => positions.set(n.id, { x: (width - nodes.length * 202) / 2 + i * 202 + 11, y: depth * 108 + 16 }));
    return { positions, edges, width, height: (Math.max(0, ...Array.from(rows.keys())) + 1) * 108 + 12 };
  }, [graph]);
  if (!graph.nodes.length) return null;
  return <section className="activity-graph-section" aria-label={graph.label}>
    <h3>{graph.label}<span>{readable(graph.state)}</span></h3>
    <div className="activity-graph-viewport"><div className="activity-graph" style={{ width: layout.width, height: layout.height }}>
      <svg width={layout.width} height={layout.height} aria-hidden="true">{layout.edges.map((e, i) => {
        const from = layout.positions.get(e.from)!, to = layout.positions.get(e.to)!;
        const x = from.x + 90, y = from.y + 64, tx = to.x + 90, ty = to.y;
        return <g key={i}><path className={e.taken ? 'taken' : ''} d={`M${x},${y} C${x},${y + 22} ${tx},${ty - 22} ${tx},${ty}`} />
          {e.label && <text x={(x + tx) / 2 + 7} y={(y + ty) / 2 + 3}>{e.label.length > 26 ? e.label.slice(0, 25) + '…' : e.label}</text>}</g>;
      })}</svg>
      {graph.nodes.map(n => {
        const pos = layout.positions.get(n.id)!, Icon = icon(n.kind);
        return <button key={n.id} data-live={running(n.state)} className={`activity-node state-${n.state} ${selected === graph.id + n.id ? 'is-selected' : ''}`}
          style={{ left: pos.x, top: pos.y }} onClick={() => onSelect(n)} aria-label={`${n.label}: ${readable(n.state)}`} title={n.label}>
          <span className="activity-node-icon"><Icon size={16} /></span><span className="activity-node-copy"><strong>{n.label}</strong><small>{readable(n.state)}</small></span>
          {n.state === 'completed' && <Check className="activity-node-check" size={13} />}
        </button>;
      })}
    </div></div>
  </section>;
}

export default function ActivityPanel({ job, onJob, onClose, onExpired }: {
  job: string; onJob: (job: string) => void; onClose: () => void; onExpired: () => void;
}) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState('');
  const [follow, setFollow] = useState(true);
  const scroll = useRef<HTMLDivElement>(null);
  const expire = useRef(onExpired); expire.current = onExpired;
  useEffect(() => {
    let alive = true;
    const abort = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    setSnapshot(null); setSelection(''); setFollow(true);
    async function poll() {
      let delay = 1500;
      try {
        const response = await fetch(`/api/minion/activity?job=${encodeURIComponent(job)}`, { cache: 'no-store', signal: abort.signal });
        if (!alive) return;
        if (response.status === 401) { expire.current(); return; }
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Activity is unavailable.');
        setSnapshot(data); setError(''); delay = data.live ? 1000 : 3000;
      } catch (e) { if (!alive) return; setError(e instanceof Error ? e.message : 'Connection interrupted.'); delay = 5000; }
      if (alive) timer = setTimeout(poll, document.hidden ? 10000 : delay);
    }
    poll();
    return () => { alive = false; abort.abort(); clearTimeout(timer); };
  }, [job]);
  const graphs: Graph[] = snapshot ? [{ id: 'execution', label: 'Execution path', state: snapshot.state, nodes: snapshot.nodes, edges: snapshot.edges }, ...snapshot.workflows] : [];
  const all = graphs.flatMap(g => g.nodes.map(n => ({ key: g.id + n.id, node: n })));
  const detail = all.find(v => v.key === selection)?.node || [...all].reverse().find(v => running(v.node.state))?.node || all.at(-1)?.node;
  const current = [...all].reverse().find(v => running(v.node.state))?.key;
  useEffect(() => {
    if (!follow) return;
    const active = scroll.current?.querySelectorAll<HTMLElement>('[data-live="true"]');
    const target = active?.length ? active[active.length - 1] : scroll.current?.querySelector<HTMLElement>('.activity-node:last-child');
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [current, snapshot?.nodes.length, follow]);
  return <GlassCard className="minion-activity" role="complementary" aria-label="Live activity" padding="0" radius="24px" intensity={2}>
    <header className="activity-header"><div><h2><GitBranch size={17} />Live activity</h2><p>Tools, waits, and workflow branches.</p></div>
      <GlassButton size="sm" variant="clear" onClick={onClose} aria-label="Close activity" icon={<X size={18} />} /></header>
    <div className="activity-controls"><label className="sr-only" htmlFor="activity-request">Inspect request</label>
      <select id="activity-request" value={job} onChange={e => onJob(e.target.value)}><option value="">Latest activity</option>
        {job && !snapshot?.requests.some(r => r.id === job) && <option value={job}>Selected request</option>}
        {snapshot?.requests.map(r => <option key={r.id} value={r.id}>{r.label} · {readable(r.state)}</option>)}
      </select><button className={follow ? 'following' : ''} onClick={() => setFollow(!follow)} aria-pressed={follow}><Radio size={13} />Follow</button></div>
    <div className="activity-status" role="status"><Circle size={7} fill="currentColor" className={error ? 'offline' : snapshot?.live ? 'live' : ''} />
      {error || (snapshot ? snapshot.live ? 'Live · updates every second' : 'Up to date' : 'Loading runtime events…')}</div>
    <div className="activity-scroll" ref={scroll} onWheel={() => setFollow(false)}>
      {snapshot && !snapshot.nodes.length && <div className="activity-empty"><GitBranch size={28} /><p>No requests yet.</p><span>Send a message to watch its execution here.</span></div>}
      {graphs.map(g => <ExecutionGraph key={g.id} graph={g} selected={selection || current || ''} onSelect={n => { setSelection(g.id + n.id); setFollow(false); }} />)}
      {snapshot?.limited && <p className="activity-limit">Showing the most recent steps for this task.</p>}
    </div>
    {detail && <section className="activity-detail" aria-label="Step details"><div className="activity-detail-title"><strong>{detail.label}</strong><span>{readable(detail.state)}</span></div>
      <dl>{detail.at != null && <><dt>Observed</dt><dd>{new Date(detail.at * 1000).toLocaleTimeString()}</dd></>}
        {detail.at != null && detail.end != null && <><dt>Duration</dt><dd>{Math.max(0, detail.end - detail.at).toFixed(2)}s</dd></>}
        {Object.entries(detail.details).filter(([,v]) => v != null).map(([k,v]) => <div key={k}><dt>{k.replaceAll('_', ' ')}</dt><dd>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</dd></div>)}
      </dl></section>}
  </GlassCard>;
}
