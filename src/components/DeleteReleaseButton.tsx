'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface DeleteReleaseButtonProps {
  releaseId: string;
  releaseName: string;
  onDeleted: () => void;
}

export default function DeleteReleaseButton({
  releaseId,
  releaseName,
  onDeleted,
}: DeleteReleaseButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/releases/${releaseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      onDeleted();
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Delete &quot;{releaseName}&quot;?</span>
        <Button variant="danger" size="sm" onClick={handleDelete} disabled={deleting}>
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
      <svg className="mr-1.5 h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span className="text-red-500">Delete Release</span>
    </Button>
  );
}
