import fs from 'node:fs/promises';
import path from 'node:path';
import YAML from 'yaml';

const settings = JSON.parse(await fs.readFile('.openai/vault-local.json', 'utf8'));
const root = path.resolve(settings.path);
const output = path.resolve('content');
const exists = async (p) => fs.access(p).then(() => true, () => false);
async function walk(dir) {
  const all = [];
  if (!await exists(dir)) return all;
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) all.push(...await walk(full));
    else if (entry.isFile() && full.endsWith('.md')) all.push(full);
  }
  return all;
}
const candidates = [path.join(root, 'index.md'), ...await walk(path.join(root, 'Maps')), ...await walk(path.join(root, 'Notes'))];
const pages = new Map();
for (const file of candidates) {
  const content = await fs.readFile(file, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (match && YAML.parse(match[1])?.publish === true) pages.set(path.resolve(file), content);
}
if (!pages.has(path.join(root, 'index.md'))) throw Error('Public index.md is required.');
const assets = new Set();
// Links from public pages to entries that are not public yet (draft or not
// written) are "unfinished": a link into Notes/ or Maps/ is kept so Quartz can
// style it as broken; a link into any other private area becomes plain text so
// private paths never reach the site.
const unfinished = [];
const rewritten = new Map();
for (const [file, content] of pages) {
  if (/file:\/\/|\/home\/dsyfb437|[CD]:[\\/]Data[\\/]/i.test(content)) {
    throw Error('Local/private path in public page: ' + path.relative(root, file));
  }
  let text = content;
  for (const match of content.matchAll(/(!?)\[([^\]\n]*)\]\(([^)\n]+)\)/g)) {
    let href = match[3].trim();
    if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
    href = decodeURIComponent(href.split('#')[0]);
    if (!href) continue;
    const target = path.resolve(path.dirname(file), href);
    if (!target.startsWith(root + path.sep)) throw Error('Link outside vault: ' + href);
    if (target.endsWith('.md')) {
      if (pages.has(target) || match[1] === '!') continue;
      const rel = path.relative(root, target);
      const kept = /^(Notes|Maps)[\\/]/.test(rel);
      unfinished.push({ from: path.relative(root, file), to: rel, kept });
      if (!kept) text = text.split(match[0]).join(match[2]);
    } else {
      if (!target.startsWith(path.join(root, 'Assets') + path.sep)) throw Error('Attachment outside Assets: ' + href);
      if (!await exists(target)) throw Error('Missing attachment: ' + href);
      if ((await fs.stat(target)).size > 20 * 1024 * 1024) throw Error('Attachment exceeds 20 MiB: ' + href);
      assets.add(target);
    }
  }
  rewritten.set(file, text);
}
if (output !== path.resolve(process.cwd(), 'content')) throw Error('Unexpected staging directory.');
const temp = path.resolve('.sites-runtime/public-content-next');
await fs.rm(temp, { recursive: true, force: true });
await fs.mkdir(temp, { recursive: true });
for (const [file, text] of rewritten) {
  const target = path.join(temp, path.relative(root, file));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, text);
}
for (const file of assets) {
  const target = path.join(temp, path.relative(root, file));
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.copyFile(file, target);
}
await fs.rm(output, { recursive: true, force: true });
await fs.rename(temp, output);
const manifest = {
  pages: [...pages.keys()].map((file) => path.relative(root, file)),
  assets: [...assets].map((file) => path.relative(root, file)),
  sourceNotes: pages.size,
  unfinished,
};
await fs.writeFile('.sites-runtime/publish-manifest.json', JSON.stringify(manifest, null, 2));
console.log('Exported ' + pages.size + ' explicitly public pages and ' + assets.size + ' referenced assets; ' + unfinished.length + ' links to unfinished pages.');
