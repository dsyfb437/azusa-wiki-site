"""List broken relative Markdown links in the published set (index.md, Notes/, Maps/)."""
import re
import sys
from pathlib import Path
from urllib.parse import unquote

root = Path(sys.argv[1]).resolve()
link = re.compile(r"!?\[[^\]\n]*\]\(([^)\n]+)\)")
broken = 0
for md in sorted(root.rglob("*.md")):
    rel = md.relative_to(root)
    # 只检查会被导出到站点的那部分，私有页面的坏链接不该拦住发布
    exported = rel.as_posix() == "index.md" or (len(rel.parts) > 1 and rel.parts[0] in {"Notes", "Maps"})
    if not exported:
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
