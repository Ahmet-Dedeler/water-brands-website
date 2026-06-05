#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';
import { spawn } from 'node:child_process';

const DEFAULT_POOLER_URL_FILE = path.join(process.cwd(), 'supabase', '.temp', 'pooler-url');
const DEFAULT_PASSWORD_FILE = '/tmp/water-brands-supabase-db-password';
const DEFAULT_DATA_ROOT = path.join(process.cwd(), 'data', 'oasis');
const BATCH_SIZE = Number(process.env.TAP_IMPORT_BATCH_SIZE || 100);

function readTextIfExists(filePath) {
  if (!filePath || !existsSync(filePath)) return null;
  return readFileSync(filePath, 'utf8').trim();
}

function readIdFilter() {
  if (!process.env.OASIS_TAP_WATER_IDS_FILE) return null;
  const text = readTextIfExists(process.env.OASIS_TAP_WATER_IDS_FILE);
  if (!text) return new Set();
  return new Set(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map(Number)
  );
}

async function findTapWaterFile() {
  if (process.env.OASIS_TAP_WATER_FILE) return process.env.OASIS_TAP_WATER_FILE;

  const latestFile = path.join(DEFAULT_DATA_ROOT, 'latest', 'tap_water_locations.json');
  if (existsSync(latestFile)) return latestFile;

  const entries = await readdir(DEFAULT_DATA_ROOT, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(DEFAULT_DATA_ROOT, entry.name, 'tap_water_locations.json'))
    .filter((filePath) => existsSync(filePath))
    .sort()
    .reverse();

  if (!candidates.length) {
    throw new Error('No tap_water_locations.json file found under data/oasis.');
  }

  return candidates[0];
}

function hashRow(row) {
  return createHash('sha256').update(JSON.stringify(row)).digest('hex');
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function csvField(value) {
  if (value === null || value === undefined) return '';
  return `"${String(value).replaceAll('"', '""')}"`;
}

function rowToCopyLine(row) {
  return [
    csvField(row.id),
    csvField(row.name ?? null),
    csvField(numberOrNull(row.score)),
    csvField(JSON.stringify(row)),
    csvField(hashRow(row)),
    csvField(new Date().toISOString()),
  ].join('\t');
}

function parsePoolerUrl(poolerUrl) {
  const url = new URL(poolerUrl);
  return {
    host: url.hostname,
    port: url.port || '5432',
    database: url.pathname.replace(/^\//, '') || 'postgres',
    user: decodeURIComponent(url.username),
  };
}

async function runPsqlBatch(rows, connection) {
  if (!rows.length) return;

  const psql = spawn(
    '/opt/homebrew/opt/libpq/bin/psql',
    [
      `host=${connection.host} port=${connection.port} dbname=${connection.database} user=${connection.user} sslmode=require`,
      '--quiet',
      '--set',
      'ON_ERROR_STOP=1',
    ],
    {
      env: {
        ...process.env,
        PGPASSWORD: connection.password,
      },
      stdio: ['pipe', 'inherit', 'inherit'],
    }
  );

  psql.stdin.write(`
begin;
create temp table stage_oasis_tap_water_locations (
  oasis_id bigint,
  name text,
  score numeric,
  raw jsonb,
  row_hash text,
  last_seen_at timestamptz
) on commit drop;
copy stage_oasis_tap_water_locations (oasis_id, name, score, raw, row_hash, last_seen_at)
from stdin with (format csv, delimiter E'\\t', quote '"', escape '"');
`);

  for (const row of rows) {
    psql.stdin.write(`${rowToCopyLine(row)}\n`);
  }

  psql.stdin.write(`\\.
insert into public.oasis_tap_water_locations as target (
  oasis_id,
  name,
  score,
  raw,
  row_hash,
  last_seen_at
)
select
  oasis_id,
  name,
  score,
  raw,
  row_hash,
  last_seen_at
from stage_oasis_tap_water_locations
where oasis_id is not null
on conflict (oasis_id) do update set
  name = excluded.name,
  score = excluded.score,
  raw = excluded.raw,
  row_hash = excluded.row_hash,
  last_seen_at = excluded.last_seen_at;
commit;
`);
  psql.stdin.end();

  await new Promise((resolve, reject) => {
    psql.on('error', reject);
    psql.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`psql exited with code ${code}`));
    });
  });
}

async function main() {
  const tapWaterFile = await findTapWaterFile();
  const poolerUrl = process.env.SUPABASE_DB_POOLER_URL || readTextIfExists(DEFAULT_POOLER_URL_FILE);
  const password = process.env.SUPABASE_DB_PASSWORD || readTextIfExists(DEFAULT_PASSWORD_FILE);

  if (!poolerUrl) throw new Error('Missing Supabase pooler URL. Link the project or set SUPABASE_DB_POOLER_URL.');
  if (!password) throw new Error('Missing Supabase DB password. Set SUPABASE_DB_PASSWORD.');

  const connection = {
    ...parsePoolerUrl(poolerUrl),
    password,
  };

  const jq = spawn('jq', ['-c', '.[]', tapWaterFile], { stdio: ['ignore', 'pipe', 'inherit'] });
  const jqDone = new Promise((resolve, reject) => {
    jq.on('error', reject);
    jq.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`jq exited with code ${code}`));
    });
  });
  const lines = createInterface({ input: jq.stdout, crlfDelay: Infinity });
  const idFilter = readIdFilter();

  let batch = [];
  let imported = 0;

  for await (const line of lines) {
    if (!line.trim()) continue;
    const row = JSON.parse(line);
    if (idFilter && !idFilter.has(Number(row.id))) continue;
    batch.push(row);
    if (batch.length >= BATCH_SIZE) {
      await runPsqlBatch(batch, connection);
      imported += batch.length;
      process.stdout.write(`\rImported tap water rows: ${imported.toLocaleString()}`);
      batch = [];
    }
  }

  if (batch.length) {
    await runPsqlBatch(batch, connection);
    imported += batch.length;
    process.stdout.write(`\rImported tap water rows: ${imported.toLocaleString()}`);
  }

  await jqDone;

  process.stdout.write(`\rImported tap water rows: ${imported.toLocaleString()}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
