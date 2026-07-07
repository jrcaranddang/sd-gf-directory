import type { VideoProvider } from './types.ts';
import { MockProvider } from './mock.ts';
import { BytePlusProvider } from './byteplus.ts';

// Selects the active provider from the PROVIDER env var (mock | byteplus | fal).
// fal.ai can be added here later with the same interface (spec §2 fallback).
export function getProvider(): VideoProvider {
  const name = (Deno.env.get('PROVIDER') ?? 'mock').toLowerCase();
  switch (name) {
    case 'byteplus':
      return new BytePlusProvider();
    case 'mock':
      return new MockProvider();
    default:
      throw new Error(`Unknown PROVIDER "${name}"`);
  }
}

export type { VideoProvider } from './types.ts';
