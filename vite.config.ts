import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
  let role = '';
  if (key.startsWith('eyJ')) {
    try { role = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role; } catch { /* Invalid keys fail authentication. */ }
  }
  if (key.startsWith('sb_secret_') || role === 'service_role') {
    throw new Error('Administrative Supabase-Schlüssel sind in der Web-App verboten. Nur Publishable-/Anon-Key verwenden.');
  }
  return { server: { host: '127.0.0.1', port: 5173, strictPort: true } };
});
