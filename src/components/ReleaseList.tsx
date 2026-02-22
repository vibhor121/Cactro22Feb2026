'use client';

import type { Release } from '@/lib/types';
import ReleaseListItem from './ReleaseListItem';
import Button from './ui/Button';
import Spinner from './ui/Spinner';

interface ReleaseListProps {
  releases: Release[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export default function ReleaseList({
  releases,
  selectedId,
  loading,
  onSelect,
  onNew,
}: ReleaseListProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">Releases</h1>
        <Button size="sm" onClick={onNew}>
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </Button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner className="h-5 w-5 text-indigo-500" />
          </div>
        ) : releases.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">No releases yet.</p>
            <p className="mt-1 text-xs text-gray-400">Click &quot;New&quot; to create your first.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {releases.map((r) => (
              <ReleaseListItem
                key={r.id}
                release={r}
                isSelected={r.id === selectedId}
                onClick={() => onSelect(r.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
