import { useEffect, useRef, useState } from 'react';
import { getJob } from '@/lib/api';
import type { Job } from '@/types';

const POLL_INTERVAL_MS = 5000; // spec §5 — client polls get-job every 5s

/**
 * Polls a job until it reaches a terminal state (succeeded | failed).
 * The user can leave the screen; a push notification fires on completion
 * (wired server-side). Cleans up its interval on unmount.
 */
export function useJobPolling(jobId: string | undefined) {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;

    const tick = async () => {
      try {
        const next = await getJob(jobId);
        if (cancelled) return;
        setJob(next);
        if (next.status === 'succeeded' || next.status === 'failed') {
          if (timer.current) clearInterval(timer.current);
        }
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load job');
      }
    };

    void tick();
    timer.current = setInterval(tick, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer.current) clearInterval(timer.current);
    };
  }, [jobId]);

  const isTerminal = job?.status === 'succeeded' || job?.status === 'failed';
  return { job, error, isTerminal };
}
