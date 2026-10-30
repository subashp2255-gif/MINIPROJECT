import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables
const ENV_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage keys for runtime configuration in demo/developer settings
const STORAGE_KEY_URL = 'srs_supabase_url';
const STORAGE_KEY_ANON = 'srs_supabase_anon_key';

export function getActiveSupabaseConfig(): { url: string; anonKey: string } {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_URL) || '' : '';
  const localAnon = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_ANON) || '' : '';

  const url = (localUrl || ENV_URL).trim();
  const anonKey = (localAnon || ENV_ANON_KEY).trim();

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getActiveSupabaseConfig();
  if (!url || !anonKey) return false;
  // Check for placeholder defaults
  if (url.includes('your-project') || url.includes('placeholder')) return false;
  if (anonKey.includes('your-anon-public-key') || anonKey.length < 20) return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
    else localStorage.removeItem(STORAGE_KEY_URL);

    if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
    else localStorage.removeItem(STORAGE_KEY_ANON);

    // Re-initialize client
    initSupabaseClient();
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY_URL);
    localStorage.removeItem(STORAGE_KEY_ANON);
    initSupabaseClient();
  }
}

let clientInstance: SupabaseClient | null = null;

function initSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getActiveSupabaseConfig();

  // If valid credentials present, connect to real Supabase
  if (url && anonKey && (url.startsWith('http://') || url.startsWith('https://'))) {
    try {
      clientInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return clientInstance;
    } catch (err) {
      console.warn('[Supabase] Failed to initialize client with configured credentials:', err);
    }
  }

  // Fallback placeholder client to prevent runtime crashes if credentials not yet configured
  clientInstance = createClient('https://placeholder.supabase.co', 'placeholder-anon-key-00000000000000000000', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return clientInstance;
}

export const supabase: SupabaseClient = initSupabaseClient();

export function getSupabase(): SupabaseClient {
  if (!clientInstance) {
    return initSupabaseClient();
  }
  return clientInstance;
}
