// Bootstrap an EMPTY local test database. Historical migrations stay immutable.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const workdir = mkdtempSync(join(tmpdir(), 'phililog-supabase-'));
const sql = input => execFileSync('docker', ['exec', '-i', 'supabase_db_phililog', 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At'], { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
try {
  // Start the platform without the CLI's non-transactional migration runner.
  mkdirSync(join(workdir, 'supabase'));
  copyFileSync('supabase/config.toml', join(workdir, 'supabase/config.toml'));
  execFileSync('npx', ['--yes', 'supabase@2.117.0', 'start', '--workdir', workdir], { stdio: 'inherit' });
  if (sql("select to_regclass('public.feedings') is not null;").trim() !== 'f') {
    throw new Error('Die lokale Datenbank enthält bereits PhiliLog. Keine Migration wiederholt. Bestehende Instanzen regulär starten und den Migrationsnachweis abgleichen.');
  }
  sql('create schema if not exists supabase_migrations; create table if not exists supabase_migrations.schema_migrations(version text primary key, statements text[], name text);');
  for (const file of readdirSync('supabase/migrations').filter(f => /^\d+_[a-z_]+\.sql$/.test(f)).sort()) {
    const version = file.split('_')[0];
    // Each migration and its receipt commit together; LOCK TABLE in 008/010 is valid.
    sql(`begin; ${readFileSync(`supabase/migrations/${file}`, 'utf8')}\ninsert into supabase_migrations.schema_migrations(version,name) values ('${version}','${file}'); commit;`);
    console.log(`Migration ${file} transaktional angewandt.`);
  }
  sql("notify pgrst, 'reload schema';");
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
