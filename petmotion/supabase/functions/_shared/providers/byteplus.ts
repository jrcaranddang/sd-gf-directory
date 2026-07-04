import type { PollResult, SubmitParams, SubmitResult, VideoProvider } from './types.ts';

// BytePlus ModelArk — Seedance 2.0 image-to-video (spec §2/§5).
// Async job API: create task -> poll task -> download.
// Endpoint/field names follow the ModelArk content-generation task API; verify
// against current docs when wiring the real account (some tenants use a
// region-specific host). The abstraction means only this file changes.
const BASE = Deno.env.get('BYTEPLUS_BASE_URL') ??
  'https://ark.ap-southeast.bytepluses.com/api/v3';
const MODEL = Deno.env.get('BYTEPLUS_MODEL') ?? 'seedance-2-0-lite-i2v';

function apiKey(): string {
  const k = Deno.env.get('BYTEPLUS_API_KEY');
  if (!k) throw new Error('BYTEPLUS_API_KEY not set');
  return k;
}

function toDataUri(bytes: Uint8Array, contentType: string): string {
  // base64 encode without blowing the stack on large images
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return `data:${contentType};base64,${btoa(binary)}`;
}

export class BytePlusProvider implements VideoProvider {
  readonly name = 'byteplus' as const;

  async submit(params: SubmitParams): Promise<SubmitResult> {
    const res = await fetch(`${BASE}/contents/generations/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        content: [
          { type: 'text', text: params.prompt },
          {
            type: 'image_url',
            image_url: { url: toDataUri(params.imageBytes, params.imageContentType) },
          },
        ],
        parameters: {
          resolution: '720p',
          ratio: params.aspectRatio,
          duration: params.durationSeconds,
          audio: params.audioEnabled,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`byteplus submit ${res.status}: ${await res.text()}`);
    }
    const json = await res.json();
    const id = json.id ?? json.task_id;
    if (!id) throw new Error('byteplus submit: missing task id');
    return { providerTaskId: id };
  }

  async poll(providerTaskId: string): Promise<PollResult> {
    const res = await fetch(`${BASE}/contents/generations/tasks/${providerTaskId}`, {
      headers: { Authorization: `Bearer ${apiKey()}` },
    });
    if (!res.ok) {
      return { status: 'failed', error: `byteplus poll ${res.status}` };
    }
    const json = await res.json();
    // Normalize provider status vocabulary -> our three states.
    const raw = String(json.status ?? '').toLowerCase();
    if (raw === 'succeeded' || raw === 'success') {
      const url = json.content?.video_url ?? json.result?.video_url;
      if (!url) return { status: 'failed', error: 'byteplus: no video url' };
      return { status: 'succeeded', videoUrl: url };
    }
    if (raw === 'failed' || raw === 'error' || raw === 'canceled') {
      return { status: 'failed', error: json.error?.message ?? 'provider failed' };
    }
    return { status: 'processing' };
  }
}
