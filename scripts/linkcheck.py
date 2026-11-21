"""List broken relative Markdown links in the vault (Archive excluded)."""
import re
import sys
from pathlib import Path
from urllib.parse import unquote

root = Path(sys.argv[1]).resolve()
link = re.compile(r"!?\[[^\]\n]*\]\(([^)\n]+)\)")
broken = 0
for md in sorted(root.rglob("*.md")):
    rel = md.relative_to(root)
    if rel.parts[0] in {"Archive", ".git", ".obsidian"}:
        continue
    for n, line in enumerate(md.read_text(encoding="utf-8").splitlines(), 1):
        for m in link.finditer(line):
            href = m.group(1).strip()
            if re.match(r"^(https?:|mailto:|#|file:|obsidian:)", href, re.I):
                continue
            target = unquote(href.split("#")[0])
            if not target:
                continue
            if target.startswith("~/"):
                continue
            if not (md.parent / target).resolve().exists():
                broken += 1
                print(f"{rel}:{n}: {href}")
print(f"broken={broken}", file=sys.stderr)
sys.exit(1 if broken else 0)
