interface DateBadgeProps {
  date: string;
}

export default function DateBadge({ date }: DateBadgeProps) {
  const d = new Date(date);
  const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  const day = d.getUTCDate();
  const year = d.getUTCFullYear();

  return (
    <div className="flex w-[54px] flex-shrink-0 flex-col items-center rounded-2xl bg-timeline-surface-2 px-2 py-2.5">
      <span className="text-[12px] font-medium text-timeline-text-secondary">{month}</span>
      <span className="text-[26px] font-bold leading-tight text-timeline-text-primary">{day}</span>
      <span className="text-[11px] font-medium text-timeline-text-secondary">{year}</span>
    </div>
  );
}
