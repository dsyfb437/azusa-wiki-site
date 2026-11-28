import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const exporter = fileURLToPath(new URL('./export-vault.mjs', import.meta.url));
const parent = path.resolve(os.tmpdir());
const workspace = await fs.mkdtemp(path.join(parent, 'azusa-wiki-export-'));
const vault = path.join(workspace, 'vault');
const content = path.join(workspace, 'content');
const visible = '---\npublish: true\n---\n';
const privatePage = '---\npublish: false\n---\n';
const run = () => execFileSync(process.execPath, [exporter], { cwd: workspace, stdio: 'pipe' });

try {
  for (const dir of ['.openai', 'vault/Notes', 'vault/Sources', 'vault/Assets']) {
    await fs.mkdir(path.join(workspace, dir), { recursive: true });
  }
  await fs.writeFile(path.join(workspace, '.openai/vault-local.json'), JSON.stringify({ path: vault }));
  await fs.writeFile(path.join(vault, 'index.md'), visible + '# Home\n');
  await fs.writeFile(path.join(vault, 'Sources/private.md'), privatePage + 'Private text');
  await fs.writeFile(path.join(vault, 'Assets/figure.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
  await fs.writeFile(path.join(vault, 'Assets/local.pdf'), 'private fixture');
  await fs.writeFile(path.join(vault, 'Notes/draft.md'), privatePage + '[original](../Assets/local.pdf)');
  const note = path.join(vault, 'Notes/chapter.md');
  await fs.writeFile(note, visible + '[source](../Sources/private.md) [later](later.md) ![figure](../Assets/figure.svg)');
  run();

  const chapter = await fs.readFile(path.join(content, 'Notes/chapter.md'), 'utf8');
  assert.ok(chapter.includes('source') && !chapter.includes('Sources/'));
  assert.ok(chapter.includes('[later](later.md)') && chapter.includes('![figure](../Assets/figure.svg)'));
  assert.deepEqual(await fs.readdir(path.join(content, 'Assets')), ['figure.svg']);
  assert.deepEqual(await fs.readdir(path.join(content, 'Notes')), ['chapter.md']);
  await assert.rejects(fs.access(path.join(content, 'Sources')), { code: 'ENOENT' });

  await fs.writeFile(note, privatePage + '![figure](../Assets/figure.svg)');
  run();
  assert.deepEqual(await fs.readdir(content), ['index.md']);
  console.log('Verified published figures, private sources and removal of unreferenced attachments.');
} finally {
  if (path.dirname(workspace) === parent && path.basename(workspace).startsWith('azusa-wiki-export-')) {
    await fs.rm(workspace, { recursive: true, force: true });
  }
}
