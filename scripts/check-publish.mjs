import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const config=JSON.parse(await fs.readFile('.openai/vault-local.json','utf8'));
const root=path.resolve(config.path);
const probe=path.join(root,'Notes','__publication_check__.md');
try {await fs.access(probe);throw Error('Reserved probe path already exists.');} catch(error){if(error.code!=='ENOENT')throw error;}
const run=()=>spawnSync(process.execPath,['scripts/export-vault.mjs'],{encoding:'utf8'});
try{
 await fs.writeFile(probe,'---\npublish: true\n---\n[private](../Meta/旧库恢复.md)\n');
 const bad=run();
 if(bad.status===0||!bad.stderr.includes('private/missing'))throw Error('Private-link rejection failed.');
 await fs.writeFile(probe,'---\npublish: false\n---\nPRIVATE_NOTE_MUST_NOT_PUBLISH\n');
 const good=run();
 if(good.status!==0)throw Error(good.stderr);
 const manifest=JSON.parse(await fs.readFile('.sites-runtime/publish-manifest.json','utf8'));
 if(manifest.pages.some(p=>p.includes('__publication_check__')||/^(Sources|Meta|Archive|Inbox|Templates)\//.test(p)))throw Error('Private content exported.');
 if(manifest.assets.length!==0)throw Error('Unreferenced attachments unexpectedly exported.');
 console.log('Verified: private links rejected, private notes excluded, only referenced assets exported.');
}finally{await fs.unlink(probe);}
