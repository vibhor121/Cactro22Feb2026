'use client';

import { PREDEFINED_STEPS } from '@/lib/steps';

interface StepItemProps {
  stepIndex: number;
  isDone: boolean;
  onToggle: (stepIndex: number, newValue: boolean) => void;
  disabled?: boolean;
}

export default function StepItem({ stepIndex, isDone, onToggle, disabled }: StepItemProps) {
  const step = PREDEFINED_STEPS[stepIndex];

  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
      <input
        type="checkbox"
        checked={isDone}
        disabled={disabled}
        onChange={(e) => onToggle(stepIndex, e.target.checked)}
        className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
      />
      <span
        className={`text-sm leading-relaxed ${
          isDone ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}
      >
        <span className="mr-1.5 text-xs font-medium text-gray-400">
          {String(stepIndex + 1).padStart(2, '0')}.
        </span>
        {step?.title ?? `Step ${stepIndex}`}
      </span>
    </label>
  );
}
