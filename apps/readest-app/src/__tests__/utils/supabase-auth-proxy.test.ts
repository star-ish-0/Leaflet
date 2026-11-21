// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const CLOUD_URL = 'https://vbsyxfusjjqdxkjqlysc.supabase.co';

const fetchMock = vi.fn<typeof fetch>();

const session = {
  access_token: 'access',
  refresh_token: 'refresh',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: { id: 'user', aud: 'authenticated', app_metadata: {}, user_metadata: {} },
};

const loadClient = async (url: string) => {
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', url);
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'anon-key');
  const { supabase } = await import('@/utils/supabase');
  return supabase;
};

const requestedUrls = () => fetchMock.mock.calls.map(([input]) => String(input));

beforeEach(() => {
  vi.resetModules();
  localStorage.clear();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(session), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

// Leaflet removed the Readest Cloud auth proxy: every auth call goes straight
// to whatever Supabase host the deployment configures, and no readest.com
// host may ever be contacted.
describe('auth routing has no Readest proxy', () => {
  it('sends the password sign-in straight to the configured host', async () => {
    const supabase = await loadClient(CLOUD_URL);

    const { error } = await supabase.auth.signInWithPassword({ email: 'a@b.c', password: 'pw' });

    expect(error).toBeNull();
    expect(requestedUrls()).toEqual([`${CLOUD_URL}/auth/v1/token?grant_type=password`]);
  });

  it('refreshes the session on the configured host', async () => {
    const supabase = await loadClient(CLOUD_URL);
    await supabase.auth.signInWithPassword({ email: 'a@b.c', password: 'pw' });
    fetchMock.mockClear();
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ ...session, access_token: 'access-2' }), { status: 200 }),
    );

    const { data, error } = await supabase.auth.refreshSession();

    expect(error).toBeNull();
    expect(data.session?.access_token).toBe('access-2');
    expect(requestedUrls()).toEqual([`${CLOUD_URL}/auth/v1/token?grant_type=refresh_token`]);
  });

  it('signs out on the configured host and drops the local session', async () => {
    const supabase = await loadClient(CLOUD_URL);
    await supabase.auth.signInWithPassword({ email: 'a@b.c', password: 'pw' });
    fetchMock.mockClear();
    fetchMock.mockImplementation(async () => new Response(null, { status: 204 }));

    await supabase.auth.signOut({ scope: 'local' });

    expect(requestedUrls()).toEqual([`${CLOUD_URL}/auth/v1/logout?scope=local`]);
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });

  it('keeps every other auth call on the configured host', async () => {
    const supabase = await loadClient(CLOUD_URL);

    await supabase.auth.signInWithOtp({ email: 'a@b.c' });
    await supabase.auth.signUp({ email: 'a@b.c', password: 'pw' });
    await supabase.auth.resetPasswordForEmail('a@b.c');
    await supabase.auth.signInWithIdToken({ provider: 'apple', token: 'id-token' });

    const urls = requestedUrls();
    expect(urls).toHaveLength(4);
    for (const url of urls) {
      expect(url.startsWith(`${CLOUD_URL}/auth/v1/`)).toBe(true);
    }
  });

  it('keeps OAuth on the configured host, where its callback lands', async () => {
    const supabase = await loadClient(CLOUD_URL);

    const { data } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { skipBrowserRedirect: true },
    });

    expect(data.url?.startsWith(`${CLOUD_URL}/auth/v1/authorize`)).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('never contacts a readest.com host, whatever the configured project is', async () => {
    const supabase = await loadClient(CLOUD_URL);

    await supabase.auth.signInWithPassword({ email: 'a@b.c', password: 'pw' });
    await supabase.auth.refreshSession();

    for (const url of requestedUrls()) {
      expect(url.includes('.readest.com')).toBe(false);
    }
  });

  it('never sends a self-hosted instance password anywhere else', async () => {
    const selfHosted = 'https://supabase.example.org';
    const supabase = await loadClient(selfHosted);

    await supabase.auth.signInWithPassword({ email: 'a@b.c', password: 'pw' });

    expect(requestedUrls()).toEqual([`${selfHosted}/auth/v1/token?grant_type=password`]);
  });
});
