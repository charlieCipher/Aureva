// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('@supabase/supabase-js', () => ({ createClient: vi.fn(() => ({})) }));
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });
async function configured(url, dev, key = 'public-test-key') {
  vi.stubEnv('VITE_SUPABASE_URL', url);
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', key);
  vi.stubEnv('DEV', dev);
  return (await import('../src/supabase.js')).supabaseConfig.configured;
}
it('allows loopback HTTP for local development', async () => {
  expect(await configured('http://127.0.0.1:54321', true)).toBe(true);
});
it('rejects HTTP in production even on loopback', async () => {
  expect(await configured('http://127.0.0.1:54321', false)).toBe(false);
});
it('rejects non-loopback HTTP during development', async () => {
  expect(await configured('http://example.com', true)).toBe(false);
});
it('retains HTTPS support in production', async () => {
  expect(await configured('https://example.supabase.co', false)).toBe(true);
});
it('rejects secret keys on local development endpoints', async () => {
  expect(await configured('http://127.0.0.1:54321', true, 'sb_secret_fixture')).toBe(false);
});
