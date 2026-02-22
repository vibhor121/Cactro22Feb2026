import type { ReleaseStatus } from './types';

export function computeStatus(doneCount: number, totalSteps: number): ReleaseStatus {
  if (doneCount === 0) return 'planned';
  if (doneCount >= totalSteps) return 'done';
  return 'ongoing';
}
