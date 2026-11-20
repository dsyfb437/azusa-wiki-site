#!/usr/bin/env bash
# 把 web/azusa-wiki/dist 推到 GitHub Pages 部署仓库。
# 构建不在这里做：先在 web/azusa-wiki 里跑 `npm run build`。
# 用法：bash scripts/deploy-wiki.sh            真部署
#       DRY_RUN=1 bash scripts/deploy-wiki.sh  只铺文件，不提交、不推送
set -euo pipefail

SITE="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY="${WIKI_DEPLOY_DIR:-$(dirname "$SITE")/.wiki-deploy}"
REPO=https://github.com/dsyfb437/azusa-wiki.git
DOMAIN=wiki.azusaaa.com
BRANCH=main

case "$DEPLOY" in
	/*) ;;
	*) echo "DEPLOY 必须是绝对路径：$DEPLOY" >&2; exit 1 ;;
esac
case "$DEPLOY" in
	"$SITE"|"$SITE"/*) echo "DEPLOY 不能放在站点目录内：$DEPLOY" >&2; exit 1 ;;
esac
case "$(basename -- "$DEPLOY")" in
	.wiki-deploy|wiki-deploy) ;;
	*) echo "DEPLOY 目录名必须是 .wiki-deploy 或 wiki-deploy：$DEPLOY" >&2; exit 1 ;;
esac

[ -f "$SITE/dist/index.html" ] || { echo "dist/index.html 不存在，先跑 npm run build" >&2; exit 1; }
[ "$(tr -d '[:space:]' < "$SITE/dist/CNAME")" = "$DOMAIN" ] || { echo "dist/CNAME 不是 $DOMAIN，拒绝部署" >&2; exit 1; }
if grep -rq 'chatgpt.site' "$SITE/dist"; then
	echo "dist 里还有占位域名 chatgpt.site，拒绝部署" >&2
	exit 1
fi

GIT=(env -u http_proxy -u https_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u all_proxy
	GIT_TERMINAL_PROMPT=0 git -c http.proxy= -c https.proxy=)

if [ ! -d "$DEPLOY/.git" ]; then
	echo "本地没有部署仓库，浅克隆 $REPO"
	rm -rf "$DEPLOY"
	"${GIT[@]}" clone --depth 1 --branch "$BRANCH" "$REPO" "$DEPLOY"
fi

# 清空工作区但保留 .git，再把构建产物铺进去。
find "$DEPLOY" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -a "$SITE/dist/." "$DEPLOY/"
touch "$DEPLOY/.nojekyll"

cd "$DEPLOY"
"${GIT[@]}" add -A
if "${GIT[@]}" diff --cached --quiet; then
	echo "没有变化，不提交"
	exit 0
fi
"${GIT[@]}" -c user.name=dsyfb437 -c user.email=dsyfb_437@outlook.com \
	commit -q -m "deploy: $(date +%F' '%H:%M)"
echo "已提交 $(find . -type f ! -path './.git/*' | wc -l) 个文件"

if [ "${DRY_RUN:-0}" = 1 ]; then
	echo "DRY_RUN=1，不推送"
	exit 0
fi
"${GIT[@]}" push origin "$BRANCH"
echo "已推送到 $REPO ($BRANCH)"
