// Provider abstraction (spec §2 fallback). Any image-to-video backend with
// submit/poll/download semantics can implement this: BytePlus, fal.ai, Segmind,
// or the local mock. create-job/get-job only talk to VideoProvider.

export interface SubmitParams {
  imageBytes: Uint8Array;
  imageContentType: string;
  prompt: string; // already has {SUBJECT} substituted
  durationSeconds: number;
  aspectRatio: string; // e.g. '9:16'
  audioEnabled: boolean;
}

export interface SubmitResult {
  providerTaskId: string;
}

export type ProviderStatus = 'processing' | 'succeeded' | 'failed';

export interface PollResult {
  status: ProviderStatus;
  /** Present when status === 'succeeded'. Provider URL, may expire (~24h). */
  videoUrl?: string;
  /** Present when status === 'failed'. */
  error?: string;
}

export interface VideoProvider {
  readonly name: 'mock' | 'byteplus' | 'fal';
  submit(params: SubmitParams): Promise<SubmitResult>;
  poll(providerTaskId: string): Promise<PollResult>;
}
