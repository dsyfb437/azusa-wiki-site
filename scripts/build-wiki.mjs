import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const commands=[];
if(existsSync('.openai/vault-local.json'))commands.push(['scripts/export-vault.mjs']);
commands.push(['./quartz/bootstrap-cli.mjs','build','-d','content','-o','dist']);
for(const args of commands){
 const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);
}
