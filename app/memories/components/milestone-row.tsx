interface MilestoneRowProps {
  emoji: string | null;
  title: string;
  date: string;
}

function daysSince(dateStr: string): number {
  const target = new Date(dateStr);
  const targetUTC = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  const now = new Date();
  const nowUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((nowUTC - targetUTC) / 86400000);
}

export default function MilestoneRow({ emoji, title, date }: MilestoneRowProps) {
  return (
    <div className="flex h-14 items-center justify-between rounded-2xl bg-timeline-surface px-4">
      <div className="flex items-center gap-2.5">
        <span className="text-2xl leading-none">{emoji ?? '📌'}</span>
        <span className="text-[15px] font-semibold text-timeline-text-primary">{title}</span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[18px] font-bold leading-none text-timeline-accent-blue">
          {daysSince(date)}
        </span>
        <span className="text-[11px] text-timeline-text-secondary">days ago</span>
      </div>
    </div>
  );
}
