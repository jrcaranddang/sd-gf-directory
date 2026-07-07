import { supabase } from './supabase';
import type { ApiError, CreateJobSuccess, Job } from '@/types';

const FUNCTIONS_BASE = `${process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''}/functions/v1`;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token ?? '';
  return { Authorization: `Bearer ${token}` };
}

export class ApiRequestError extends Error {
  code?: string;
  status: number;
  constructor(status: number, body: ApiError) {
    super(body.error);
    this.status = status;
    this.code = body.code;
  }
}

/**
 * Kick off generation. Uploads the local image to the private bucket, then
 * calls create-job. The Edge Function enforces entitlement + quota, so the
 * client can optimistically navigate to the status screen on success.
 */
export async function createJob(params: {
  templateId: string;
  imagePath: string; // storage path already uploaded by caller
}): Promise<CreateJobSuccess> {
  const res = await fetch(`${FUNCTIONS_BASE}/create-job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await authHeader()),
    },
    body: JSON.stringify({
      template_id: params.templateId,
      input_image_path: params.imagePath,
    }),
  });

  const body = await res.json();
  if (!res.ok) throw new ApiRequestError(res.status, body as ApiError);
  return body as CreateJobSuccess;
}

export async function getJob(jobId: string): Promise<Job> {
  const res = await fetch(`${FUNCTIONS_BASE}/get-job?id=${encodeURIComponent(jobId)}`, {
    method: 'GET',
    headers: { ...(await authHeader()) },
  });
  const body = await res.json();
  if (!res.ok) throw new ApiRequestError(res.status, body as ApiError);
  return body as Job;
}
