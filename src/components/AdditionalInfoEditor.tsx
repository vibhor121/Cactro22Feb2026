'use client';

import { useState } from 'react';
import Button from './ui/Button';

interface AdditionalInfoEditorProps {
  releaseId: string;
  initialValue: string | null;
  onSaved: (newValue: string | null) => void;
}

export default function AdditionalInfoEditor({
  releaseId,
  initialValue,
  onSaved,
}: AdditionalInfoEditorProps) {
  const [value, setValue] = useState(initialValue ?? '');
  const [saving, setSaving] = useState(false);
  const isDirty = value !== (initialValue ?? '');

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/releases/${releaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ additional_info: value.trim() || null }),
      });
      if (!res.ok) throw new Error('Failed to save');
      onSaved(value.trim() || null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        Additional Notes
      </label>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
        placeholder="Add any notes, links, or context for this release..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
      />
      {isDirty && (
        <div className="mt-2 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? 'Saving…' : 'Save Notes'}
          </Button>
        </div>
      )}
    </div>
  );
}
