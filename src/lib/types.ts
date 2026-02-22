export type ReleaseStatus = 'planned' | 'ongoing' | 'done';

export interface StepState {
  id: string;
  release_id: string;
  step_index: number;
  is_done: boolean;
  updated_at: string;
}

export interface Release {
  id: string;
  name: string;
  release_date: string;
  additional_info: string | null;
  created_at: string;
  updated_at: string;
  status: ReleaseStatus;
  done_count: number;
  total_steps: number;
}

export interface ReleaseDetail extends Release {
  steps: StepState[];
}

export interface CreateReleaseBody {
  name: string;
  release_date: string;
  additional_info?: string;
}

export interface UpdateReleaseBody {
  name?: string;
  release_date?: string;
  additional_info?: string | null;
}

export interface ToggleStepsBody {
  updates: { step_index: number; is_done: boolean }[];
}

export interface PredefinedStep {
  index: number;
  title: string;
}
