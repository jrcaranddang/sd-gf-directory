import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Template } from '@/types';

interface State {
  templates: Template[];
  loading: boolean;
  error: string | null;
}

/**
 * Loads active templates from Supabase, ordered by sort_order. Templates are
 * remote-configurable (spec §3) — no app update needed to add one.
 */
export function useTemplates() {
  const [state, setState] = useState<State>({
    templates: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      setState({ templates: [], loading: false, error: error.message });
      return;
    }
    setState({ templates: (data ?? []) as Template[], loading: false, error: null });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}

export function useTemplate(id: string | undefined) {
  const { templates, loading, error } = useTemplates();
  const template = id ? templates.find((t) => t.id === id) ?? null : null;
  return { template, loading, error };
}
