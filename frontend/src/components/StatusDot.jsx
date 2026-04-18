const STATUS_COLORS = {
  OPEN:        'bg-civic',
  IN_PROGRESS: 'bg-sun',
  RESOLVED:    'bg-moss',
};
const PRIORITY_COLORS = {
  LOW:    'bg-ink-faint',
  MEDIUM: 'bg-ink-mute',
  HIGH:   'bg-sun',
  URGENT: 'bg-flag',
};
const STATUS_LABELS = {
  OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved',
};
const PRIORITY_LABELS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent',
};

export default function StatusDot({ value, type = 'status' }) {
  const colors  = type === 'status' ? STATUS_COLORS  : PRIORITY_COLORS;
  const labels  = type === 'status' ? STATUS_LABELS  : PRIORITY_LABELS;
  const color   = colors[value]  ?? 'bg-ink-faint';
  const label   = labels[value]  ?? value;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`dot ${color}`} />
      <span className="text-body text-ink">{label}</span>
    </span>
  );
}
