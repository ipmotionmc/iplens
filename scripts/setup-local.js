/* eslint-disable no-console */
/**
 * One-shot local development setup.
 *
 * Every step is idempotent, so this is safe to re-run and cheap when there is nothing to
 * do — which is why `start:local` can call it every time rather than being a one-off.
 *
 * Prerequisites: Node 22, pnpm, Docker. Run `pnpm install` first.
 */
import { execSync } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';
import crypto from 'node:crypto';

const run = cmd => execSync(cmd, { stdio: 'inherit' });

// 1. Environment file. Generated once per machine, then left alone.
//    Compose reads DB_PORT from this same file, so one line moves both the published
//    port and the connection string.
if (!existsSync('.env')) {
  const dbPort = process.env.DB_PORT || '54329';
  writeFileSync(
    '.env',
    [
      `DB_PORT=${dbPort}`,
      `DATABASE_URL=postgresql://iplens:iplens@localhost:${dbPort}/iplens`,
      `APP_SECRET=${crypto.randomBytes(32).toString('hex')}`,
      `TWO_FACTOR_ENCRYPTION_KEY=${crypto.randomBytes(32).toString('hex')}`,
      '',
    ].join('\n'),
  );
  console.log(`✓ wrote .env (database on port ${dbPort})`);
} else {
  console.log('· .env already present, leaving it alone');
}

// 2. Datastore. --wait blocks on the healthcheck defined in the compose file.
console.log('· starting postgres');
run('docker compose -f docker-compose.local.yml up -d --wait');

// 3. Prisma client, then schema. check-db runs `prisma migrate deploy` itself.
console.log('· generating prisma client');
run('pnpm build-db');
console.log('· applying migrations');
run('pnpm check-db');

console.log('\n✓ ready — run `pnpm dev`, then open http://localhost:3000');
console.log('  an admin user is created by the first migration');
