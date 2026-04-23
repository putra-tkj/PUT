import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

/**
 * Get the Supabase client instance. 
 * Lazily initializes the client to avoid crashing on startup if env vars are missing.
 */
export function getSupabase() {
  if (!supabaseInstance) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase configuration missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
      // Return a non-functional proxy instead of throwing to prevent top-level crash
      return new Proxy({} as any, {
        get: () => {
          console.error('Supabase keys are not configured yet.');
          return () => ({ error: { message: 'Supabase keys missing' } });
        }
      });
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// Proxy object to maintain backward compatibility with direct `supabase` imports
// while ensuring lazy initialization and better error handling.
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    const instance = getSupabase();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
