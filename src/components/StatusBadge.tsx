import type { ReleaseStatus } from '@/lib/types';

const config: Record<ReleaseStatus, { label: string; className: string }> = {
  planned: {
    label: 'Planned',
    className: 'bg-gray-100 text-gray-700',
  },
  ongoing: {
    label: 'Ongoing',
    className: 'bg-amber-100 text-amber-700',
  },
  done: {
    label: 'Done',
    className: 'bg-green-100 text-green-700',
  },
};

interface StatusBadgeProps {
  status: ReleaseStatus;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {label}
    </span>
  );
}
