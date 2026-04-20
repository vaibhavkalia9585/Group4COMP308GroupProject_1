const STATUS_COLORS = {
  OPEN:        'bg-brand-primary',
  IN_PROGRESS: 'bg-blue-400',
  RESOLVED:    'bg-gray-400',
};

const PRIORITY_COLORS = {
  LOW:    'bg-gray-300',
  MEDIUM: 'bg-slate-400',
  HIGH:   'bg-blue-500',
  URGENT: 'bg-brand-accent',
};

const STATUS_LABELS   = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved' };
const PRIORITY_LABELS = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };

export default function StatusDot({ value, type = 'status' }) {
  const colors = type === 'status' ? STATUS_COLORS : PRIORITY_COLORS;
  const labels = type === 'status' ? STATUS_LABELS : PRIORITY_LABELS;
  const color  = colors[value] ?? 'bg-gray-300';
  const label  = labels[value] ?? value;
  const urgent = value === 'URGENT';

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1">
      <span className="relative inline-flex">
        {urgent && (
          <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ping`} />
        )}
        <span className={`dot relative ${color}`} />
      </span>
      <span className="text-body text-text-primary">{label}</span>
    </span>
  );
}
