import fs from 'node:fs';
import YAML from 'yaml';
const config = YAML.parse(fs.readFileSync('quartz.config.default.yaml','utf8'));
Object.assign(config.configuration, {
  pageTitle: "azusa's wiki", pageTitleSuffix: " · azusa's wiki",
  locale: 'zh-CN', baseUrl: 'wiki.azusaaa.com',
  analytics: null, publishAssets: 'referenced',
  ignorePatterns: ['private', '.obsidian', '.git', 'Inbox', 'Sources', 'Archive', 'Templates', 'Home.md', 'README.md']
});
config.configuration.theme.fontOrigin='local';
config.configuration.theme.cdnCaching=false;
config.configuration.theme.typography={header:'Segoe UI',body:'Segoe UI',code:'Cascadia Code'};
Object.assign(config.configuration.theme.colors.lightMode,{light:'#fbfaf7',dark:'#252431',darkgray:'#4f4c5c',secondary:'#7157ad',tertiary:'#8575a5',highlight:'rgba(113,87,173,0.09)'});
Object.assign(config.configuration.theme.colors.darkMode,{light:'#1d1b25',dark:'#eeecf3',darkgray:'#c6c0d1',secondary:'#b5a0e0',tertiary:'#9e8bba',highlight:'rgba(181,160,224,0.11)'});
for(const plugin of config.plugins){
  if(plugin.source.endsWith('/explicit-publish'))plugin.enabled=true;
  if(['/og-image','/encrypted-pages','/canvas-page','/bases-page'].some(x=>plugin.source.endsWith(x)))plugin.enabled=false;
  if(plugin.source.endsWith('/footer'))plugin.options={links:{'博客':'https://azusaaa.com/','Quartz':'https://quartz.jzhao.xyz/'}};
}
fs.writeFileSync('quartz.config.yaml',YAML.stringify(config));
console.log('Configured azusa\'s wiki, explicit publishing and referenced assets.');
