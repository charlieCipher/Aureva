// Read-only checks against the explicitly authorized LEQVOR Supabase project.
// Uses only the public app key. Never prints keys, response bodies or row values.
import { loadEnv } from 'vite';
import { createClient } from '@supabase/supabase-js';
import process from 'node:process';

const env = loadEnv('development', process.cwd(), 'VITE_');
const url = env.VITE_SUPABASE_URL?.trim();
const key = (env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY)?.trim();
try {
  if (new URL(url).origin !== 'https://awdsyhxdnyfilnzamflt.supabase.co') throw new Error('target');
  if (!key || key.startsWith('sb_secret_')) throw new Error('key');
  if (key.split('.').length === 3 && JSON.parse(Buffer.from(key.split('.')[1], 'base64url')).role !== 'anon') throw new Error('role');
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) },
  });
  for (const table of ['vaults','records','record_files','trusted_people','ciphertext_cleanup_jobs']) {
    const { error, data } = await client.from(table).select('id').limit(1);
    if (error?.code === '42501') console.log(`PASS anonymous permission denied: ${table}`);
    else if (!error && data?.length === 0) console.log(`REVIEW anonymous empty result (not proof of denial): ${table}`);
    else throw new Error('unexpected response');
  }
} catch {
  console.error('Anonymous production check incomplete; details suppressed to avoid exposing response data.');
  process.exitCode = 1;
}
