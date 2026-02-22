'use client';

import type { Release } from '@/lib/types';
import StatusBadge from './StatusBadge';

interface ReleaseListItemProps {
  release: Release;
  isSelected: boolean;
  onClick: () => void;
}

export default function ReleaseListItem({ release, isSelected, onClick }: ReleaseListItemProps) {
  const progress = Math.round((release.done_count / release.total_steps) * 100);
  const date = new Date(release.release_date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg p-3 text-left transition-colors ${
        isSelected
          ? 'bg-indigo-50 ring-1 ring-indigo-200'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <span className="truncate text-sm font-semibold text-gray-900">{release.name}</span>
        <StatusBadge status={release.status} size="sm" />
      </div>
      <p className="mb-2 text-xs text-gray-500">{date}</p>
      {/* Mini progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-indigo-400 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {release.done_count}/{release.total_steps} steps
      </p>
    </button>
  );
}
