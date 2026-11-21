// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadStorageKey = async (url?: string) => {
  vi.resetModules();
  if (url) vi.stubEnv('SUPABASE_URL', url);
  vi.stubEnv('SUPABASE_ANON_KEY', 'anon-key');
  const { supabase } = await import('@/utils/supabase');
  return (supabase.auth as unknown as { storageKey: string }).storageKey;
};

describe('supabase session storage key', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is a fixed Leaflet key, independent of the configured host', async () => {
    expect(await loadStorageKey('https://example.supabase.co')).toBe('sb-leaflet-auth-token');
    expect(await loadStorageKey('http://localhost:54321')).toBe('sb-leaflet-auth-token');
  });
});
