'use client';

import { useState, FormEvent } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import type { Release } from '@/lib/types';

interface CreateReleaseModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (release: Release) => void;
}

export default function CreateReleaseModal({ open, onClose, onCreate }: CreateReleaseModalProps) {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function reset() {
    setName('');
    setReleaseDate('');
    setAdditionalInfo('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Release name is required'); return; }
    if (!releaseDate) { setError('Release date is required'); return; }

    setSubmitting(true);
    try {
      // datetime-local gives no timezone — append Z to treat as UTC
      const isoDate = releaseDate.includes('Z') ? releaseDate : `${releaseDate}:00Z`;

      const res = await fetch('/api/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          release_date: isoDate,
          additional_info: additionalInfo.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Failed to create release');
        return;
      }

      const release: Release = await res.json();
      onCreate(release);
      reset();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New Release">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Release Name <span className="text-red-500">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. v2.4.0"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Target Release Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="datetime-local"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={3}
            placeholder="Optional context or links..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Release'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
