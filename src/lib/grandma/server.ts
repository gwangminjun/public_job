import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  DEFAULT_GRANDMA_EVENT_CONFIG,
  DEFAULT_GRANDMA_TIMELINE,
  GrandmaEventConfig,
  GrandmaPhoto,
  GrandmaTimelineEvent,
} from './shared';

export async function getGrandmaConfig(): Promise<GrandmaEventConfig> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from('grandma_config').select('*').eq('id', 1).maybeSingle();

  if (error || !data) {
    return DEFAULT_GRANDMA_EVENT_CONFIG;
  }

  return data;
}

export async function getGrandmaTimeline(): Promise<GrandmaTimelineEvent[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('grandma_timeline')
    .select('id, year, title, description, emoji, highlight, sort_order')
    .order('sort_order', { ascending: true })
    .order('year', { ascending: true });

  if (error || !data || data.length === 0) {
    return DEFAULT_GRANDMA_TIMELINE;
  }

  return data;
}

export async function getGrandmaPhotos(): Promise<GrandmaPhoto[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('grandma_photos')
    .select('id, storage_path, caption, taken_year, sort_order, created_at')
    .order('sort_order', { ascending: true })
    .order('taken_year', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    ...row,
    publicUrl: supabase.storage.from('grandma-photos').getPublicUrl(row.storage_path).data.publicUrl,
  }));
}
