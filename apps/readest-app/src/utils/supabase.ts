import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getRuntimeConfig } from '@/services/runtimeConfig';
import { withAuthRequestTimeout } from './authRequestTimeout';

// Leaflet ships without any hosted cloud backend: credentials must come from
// the deployment's own environment. When none are configured the client is
// built against a harmless placeholder so importing this module never throws;
// nothing in the app contacts a hosted backend unless one is provided here.
const supabaseUrl =
  getRuntimeConfig()?.supabaseUrl ||
  process.env['SUPABASE_URL'] ||
  process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
  'http://localhost';
const supabaseAnonKey =
  getRuntimeConfig()?.supabaseAnonKey ||
  process.env['SUPABASE_ANON_KEY'] ||
  process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] ||
  'leaflet-public-anon-key';

const authFetch = withAuthRequestTimeout((input, init) => fetch(input, init));

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { storageKey: 'sb-leaflet-auth-token' },
  global: { fetch: authFetch },
});

export const createSupabaseClient = (accessToken?: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    },
  });
};

export const createSupabaseAdminClient = () => {
  const supabaseAdminKey = process.env['SUPABASE_ADMIN_KEY'] || '';
  return createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};
