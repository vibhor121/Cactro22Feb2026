'use client';

import { useState, useEffect } from 'react';
import type { ReleaseDetail as ReleaseDetailType, ReleaseStatus } from '@/lib/types';
import StatusBadge from './StatusBadge';
import StepChecklist from './StepChecklist';
import AdditionalInfoEditor from './AdditionalInfoEditor';
import DeleteReleaseButton from './DeleteReleaseButton';
import Spinner from './ui/Spinner';

interface ReleaseDetailProps {
  releaseId: string;
  onBack?: () => void;
  onDeleted: (id: string) => void;
  onStatusChange: (id: string, status: ReleaseStatus, doneCount: number) => void;
}

export default function ReleaseDetail({
  releaseId,
  onBack,
  onDeleted,
  onStatusChange,
}: ReleaseDetailProps) {
  const [release, setRelease] = useState<ReleaseDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/releases/${releaseId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load');
        return r.json();
      })
      .then(setRelease)
      .catch(() => setError('Failed to load release details.'))
      .finally(() => setLoading(false));
  }, [releaseId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-6 w-6 text-indigo-500" />
      </div>
    );
  }

  if (error || !release) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-500">{error || 'Release not found.'}</p>
      </div>
    );
  }

  const releaseDate = new Date(release.release_date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  function handleStatusChange(status: ReleaseStatus, doneCount: number) {
    setRelease((r) => r ? { ...r, status, done_count: doneCount } : r);
    onStatusChange(releaseId, status, doneCount);
  }

  function handleAdditionalInfoSaved(newValue: string | null) {
    setRelease((r) => r ? { ...r, additional_info: newValue } : r);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        {/* Mobile back button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-3 flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 md:hidden"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        )}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-900">{release.name}</h2>
            <p className="mt-0.5 text-sm text-gray-500">Target: {releaseDate}</p>
          </div>
          <StatusBadge status={release.status} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Checklist */}
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Release Steps
          </h3>
          <StepChecklist
            releaseId={releaseId}
            initialSteps={release.steps}
            onStatusChange={handleStatusChange}
          />
        </section>

        {/* Additional Info */}
        <section>
          <AdditionalInfoEditor
            releaseId={releaseId}
            initialValue={release.additional_info}
            onSaved={handleAdditionalInfoSaved}
          />
        </section>

        {/* Danger zone */}
        <section className="border-t border-gray-100 pt-4">
          <DeleteReleaseButton
            releaseId={releaseId}
            releaseName={release.name}
            onDeleted={() => onDeleted(releaseId)}
          />
        </section>
      </div>
    </div>
  );
}
