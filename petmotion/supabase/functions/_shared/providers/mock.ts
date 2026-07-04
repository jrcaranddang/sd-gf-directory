import type { PollResult, SubmitParams, SubmitResult, VideoProvider } from './types.ts';

// Mock provider (spec §7 M3): "returns a sample MP4 after 20s". The task id
// encodes the submit timestamp so poll() can decide when it's "done" without
// any external state — perfect for end-to-end testing the client flow.
const READY_AFTER_MS = 20_000;
const SAMPLE_MP4 =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBigBuckBunny.mp4';

export class MockProvider implements VideoProvider {
  readonly name = 'mock' as const;

  async submit(_params: SubmitParams): Promise<SubmitResult> {
    return { providerTaskId: `mock_${Date.now()}` };
  }

  async poll(providerTaskId: string): Promise<PollResult> {
    const submittedAt = Number(providerTaskId.replace('mock_', ''));
    const elapsed = Date.now() - submittedAt;
    if (Number.isNaN(submittedAt)) return { status: 'failed', error: 'bad task id' };
    if (elapsed < READY_AFTER_MS) return { status: 'processing' };
    return { status: 'succeeded', videoUrl: SAMPLE_MP4 };
  }
}
