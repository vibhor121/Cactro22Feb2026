'use client';

import { useState } from 'react';
import type { StepState, ReleaseStatus } from '@/lib/types';
import { STEP_COUNT } from '@/lib/steps';
import StepItem from './StepItem';

interface StepChecklistProps {
  releaseId: string;
  initialSteps: StepState[];
  onStatusChange: (status: ReleaseStatus, doneCount: number) => void;
}

export default function StepChecklist({
  releaseId,
  initialSteps,
  onStatusChange,
}: StepChecklistProps) {
  const [steps, setSteps] = useState<StepState[]>(initialSteps);
  const [saving, setSaving] = useState<Set<number>>(new Set());

  const doneCount = steps.filter((s) => s.is_done).length;
  const progress = Math.round((doneCount / STEP_COUNT) * 100);

  async function handleToggle(stepIndex: number, newValue: boolean) {
    // Optimistic update
    const prev = steps.map((s) =>
      s.step_index === stepIndex ? { ...s, is_done: newValue } : s
    );
    setSteps(prev);
    setSaving((s) => new Set(s).add(stepIndex));

    try {
      const res = await fetch(`/api/releases/${releaseId}/steps`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates: [{ step_index: stepIndex, is_done: newValue }] }),
      });

      if (!res.ok) throw new Error('Failed to save');

      const data = await res.json();
      setSteps(data.steps);
      onStatusChange(data.status, data.done_count);
    } catch {
      // Revert on error
      setSteps(steps);
    } finally {
      setSaving((s) => {
        const next = new Set(s);
        next.delete(stepIndex);
        return next;
      });
    }
  }

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
          <span>{doneCount} of {STEP_COUNT} steps completed</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {steps.map((step) => (
          <StepItem
            key={step.step_index}
            stepIndex={step.step_index}
            isDone={step.is_done}
            onToggle={handleToggle}
            disabled={saving.has(step.step_index)}
          />
        ))}
      </div>
    </div>
  );
}
