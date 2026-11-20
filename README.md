# azusa's wiki

Quartz 5 site for selected notes from the local Obsidian vault.

The private vault and historical attachments live outside this repository. Only explicitly public pages from `index.md`, `Maps/` and `Notes/` are staged for publication; local paths and links to private notes are rejected.

## Local workflow

1. Set the untracked `.openai/vault-local.json` to `{ "path": "/absolute/path/to/vault" }`.
2. `node scripts/export-vault.mjs` stages selected pages.
3. `node scripts/build-wiki.mjs` exports and builds to `dist/`.
4. `npx quartz build -d content -o dist --serve` serves a local preview.

The private source vault has its own Git history. It is not pushed by the site workflow. Large historical attachments are retained locally and in their original backup.

The site engine is based on [Quartz](https://github.com/jackyzha0/quartz), under its MIT license. Notes retain their source attribution; no global content relicensing is implied.
