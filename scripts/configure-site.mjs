import fs from 'node:fs';
import YAML from 'yaml';
const config = YAML.parse(fs.readFileSync('quartz.config.default.yaml','utf8'));
Object.assign(config.configuration, {
  pageTitle: "azusa's wiki", pageTitleSuffix: " · azusa's wiki",
  locale: 'zh-CN', baseUrl: 'wiki.azusaaa.com',
  analytics: null, publishAssets: 'referenced',
  ignorePatterns: ['private', '.obsidian', '.git', 'Inbox', 'Sources', 'Meta', 'CLAUDE.md', 'Archive', 'Templates', 'Home.md', 'README.md']
});
config.configuration.theme.fontOrigin='local';
config.configuration.theme.cdnCaching=false;
config.configuration.theme.typography={header:'Segoe UI',body:'Segoe UI',code:'Cascadia Code'};
Object.assign(config.configuration.theme.colors.lightMode, {
  light: '#faf8f3', lightgray: '#dcd6cc', gray: '#766f67', darkgray: '#45403b',
  dark: '#292520', secondary: '#563f35', tertiary: '#a55137',
  highlight: 'rgba(154,76,49,0.08)', textHighlight: '#e6b38270',
});
Object.assign(config.configuration.theme.colors.darkMode, {
  light: '#221f1c', lightgray: '#47403a', gray: '#a69d92', darkgray: '#dcd5c9',
  dark: '#f5eee5', secondary: '#e6cbb9', tertiary: '#eea184',
  highlight: 'rgba(232,157,127,0.11)', textHighlight: '#98614680',
});
for(const plugin of config.plugins){
  if(plugin.source.endsWith('/explicit-publish'))plugin.enabled=true;
  if(plugin.source.endsWith('/table-of-contents'))plugin.options={...plugin.options,maxDepth:6,minEntries:0};
  if(['/og-image','/encrypted-pages','/canvas-page','/bases-page','/backlinks','/explorer'].some(x=>plugin.source.endsWith(x)))plugin.enabled=false;
  if(plugin.source.endsWith('/footer'))plugin.options={links:{'博客':'https://azusaaa.com/','Quartz':'https://quartz.jzhao.xyz/'}};
}
fs.writeFileSync('quartz.config.yaml',YAML.stringify(config));
console.log('Configured azusa\'s wiki, explicit publishing and referenced assets.');
