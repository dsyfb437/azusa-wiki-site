import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(await fs.readFile('.openai/vault-local.json', 'utf8'));
const root = path.resolve(config.path);
const name = '__publication_check__.md';
const probe = path.join(root, 'Notes', name);
try { await fs.access(probe); throw Error('Reserved probe path already exists.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const run = () => spawnSync(process.execPath, ['scripts/export-vault.mjs'], { encoding: 'utf8' });
try {
  // A public page linking to a private doc and to an unwritten entry must still export:
  // the private link becomes plain text, the unwritten entry stays as an unfinished link.
  await fs.writeFile(probe, '---\npublish: true\n---\n[私有说明](../Sources/资料目录.md) [未完工](未完工条目.md)\n');
  const loose = run();
  if (loose.status !== 0) throw Error('Export failed on unfinished links: ' + loose.stderr);
  const out = await fs.readFile(path.join('content', 'Notes', name), 'utf8');
  if (out.includes('Sources/') || !out.includes('私有说明')) throw Error('Private link was not reduced to plain text.');
  if (!out.includes('(未完工条目.md)')) throw Error('Unfinished entry link was dropped.');
  await fs.writeFile(probe, '---\npublish: false\n---\nPRIVATE_NOTE_MUST_NOT_PUBLISH\n');
  const good = run();
  if (good.status !== 0) throw Error(good.stderr);
  const manifest = JSON.parse(await fs.readFile('.sites-runtime/publish-manifest.json', 'utf8'));
  if (manifest.pages.some(p => p.includes('__publication_check__') || /^(Sources|Archive|Templates|Logs)\//.test(p))) throw Error('Private content exported.');
  if (manifest.assets.length !== 0) throw Error('Unreferenced attachments unexpectedly exported.');
  console.log('Verified: private links become plain text, unfinished entries stay linked, private notes excluded.');
} finally { await fs.unlink(probe); }
