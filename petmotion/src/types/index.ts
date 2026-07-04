/**
 * Shared domain types. These mirror the Supabase schema in
 * supabase/migrations/0001_init.sql — keep them in sync.
 */

export type TemplateCategory = 'funny' | 'heartwarming' | 'epic' | 'seasonal';

export type JobStatus =
  | 'queued'
  | 'submitted'
  | 'processing'
  | 'succeeded'
  | 'failed';

export type ProviderName = 'mock' | 'byteplus' | 'fal';

export interface Template {
  id: string;
  title: string;
  category: TemplateCategory;
  preview_url: string;
  /** Full Seedance prompt with a {SUBJECT} slot. Server-side only in production. */
  prompt: string;
  duration_seconds: number;
  aspect_ratio: string;
  audio_enabled: boolean;
  sort_order: number;
  is_active: boolean;
}

export interface Job {
  id: string;
  user_id: string;
  template_id: string;
  status: JobStatus;
  input_image_path: string;
  provider: ProviderName;
  provider_task_id: string | null;
  output_video_url: string | null;
  output_storage_path: string | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface Profile {
  id: string;
  created_at: string;
  rc_app_user_id: string | null;
  generations_this_week: number;
  week_reset_at: string | null;
}

/** Error codes surfaced by the create-job Edge Function. */
export type CreateJobErrorCode =
  | 'PAYWALL' // 403 — no active entitlement
  | 'QUOTA' // 429 — weekly quota exhausted
  | 'DAILY_CAP' // 429 — per-user daily cap hit
  | 'KILL_SWITCH' // 503 — global daily spend cap hit
  | 'INVALID_IMAGE' // 400
  | 'UNAUTHENTICATED'; // 401

export interface CreateJobSuccess {
  job_id: string;
  status: JobStatus;
}

export interface ApiError {
  error: string;
  code?: CreateJobErrorCode;
}
