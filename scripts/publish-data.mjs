#!/usr/bin/env node
/**
 * publish-data.mjs — commit & push public/data to GitHub via the Git Data API.
 *
 * WHY: some agent/sandbox environments forbid unlink/rename inside `.git`, so a
 * local `git commit`/`git push` cannot run. This script never touches `.git`:
 * it reads files from disk and creates the commit through GitHub's HTTP API.
 *
 * Flow: read branch tip -> base tree -> diff local vs remote by git-blob sha ->
 * create blobs for changed files -> new tree (on base_tree) -> commit -> move ref.
 *
 * Usage:
 *   GITHUB_TOKEN=xxx pnpm data:publish -- "data: 2026-07-23 morning report"
 *   pnpm data:publish -- --dry-run        # read-only, no token needed (public repo)
 *
 * Env: GITHUB_TOKEN (required for real run) · GITHUB_REPO (default sinner/tradding-dashboard)
 *      GITHUB_BRANCH (default main)
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, sep } from 'node:path';

/** Token from env, or from a gitignored `.github-token` file at repo root. */
function resolveToken() {
  if (process.env.GITHUB_TOKEN?.trim()) return process.env.GITHUB_TOKEN.trim();
  const file = process.env.GITHUB_TOKEN_FILE ?? '.github-token';
  if (existsSync(file)) return readFileSync(file, 'utf8').trim() || undefined;
  return undefined;
}

const REPO = process.env.GITHUB_REPO ?? 'sinner/tradding-dashboard';
const BRANCH = process.env.GITHUB_BRANCH ?? 'main';
const TOKEN = resolveToken();
const DATA_DIR = 'public/data';
const API = 'https://api.github.com';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const message =
  args.find((a) => !a.startsWith('--')) ?? `data: update ${new Date().toISOString()}`;

const log = (...a) => console.log('[publish-data]', ...a);

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

/** git blob sha1 = sha1("blob <len>\0<bytes>") */
function gitBlobSha(buf) {
  return createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');
}

async function gh(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${init.method ?? 'GET'} ${path} -> ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  if (!TOKEN && !dryRun) {
    console.error('[publish-data] ERROR: GITHUB_TOKEN not set. Aborting (no local git touched).');
    process.exit(1);
  }

  const ref = await gh(`/repos/${REPO}/git/ref/heads/${BRANCH}`);
  const baseCommitSha = ref.object.sha;
  const baseCommit = await gh(`/repos/${REPO}/git/commits/${baseCommitSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  const tree = await gh(`/repos/${REPO}/git/trees/${baseTreeSha}?recursive=1`);
  const remote = new Map(
    tree.tree.filter((x) => x.type === 'blob').map((x) => [x.path, x.sha]),
  );

  const changed = [];
  for (const file of walk(DATA_DIR)) {
    const buf = readFileSync(file);
    const repoPath = file.split(sep).join('/'); // e.g. public/data/manifest.json
    if (remote.get(repoPath) !== gitBlobSha(buf)) changed.push({ repoPath, buf });
  }

  if (changed.length === 0) {
    log(`nothing to publish — ${DATA_DIR} already matches ${REPO}@${BRANCH}.`);
    return;
  }
  log(`${changed.length} changed file(s):`);
  changed.forEach((c) => log('  •', c.repoPath));

  if (dryRun) {
    log('dry-run: no blobs/commit created.');
    return;
  }

  const treeEntries = [];
  for (const c of changed) {
    const blob = await gh(`/repos/${REPO}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({ content: c.buf.toString('base64'), encoding: 'base64' }),
    });
    treeEntries.push({ path: c.repoPath, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const newTree = await gh(`/repos/${REPO}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  const commit = await gh(`/repos/${REPO}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [baseCommitSha] }),
  });

  await gh(`/repos/${REPO}/git/refs/heads/${BRANCH}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  log(`published ${commit.sha.slice(0, 7)} to ${REPO}@${BRANCH} (${changed.length} file(s)).`);
}

main().catch((e) => {
  console.error('[publish-data]', e.message);
  process.exit(1);
});
