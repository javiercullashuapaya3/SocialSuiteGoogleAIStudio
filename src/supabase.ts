import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const cleaned = raw.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
  if (!cleaned) return '';
  const withProtocol = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin + parsed.pathname.replace(/\/+$/, '');
    }
    return '';
  } catch {
    return '';
  }
}

function normalizeAnonKey(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/^['"]|['"]$/g, '');
}

export const SUPABASE_URL = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const SUPABASE_ANON = normalizeAnonKey(import.meta.env.VITE_SUPABASE_ANON_KEY);
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON);

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON || 'placeholder-anon-key'
);
