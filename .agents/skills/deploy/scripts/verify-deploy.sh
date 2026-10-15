#!/usr/bin/env bash
# デプロイ後に、配信されているファイルが揃っているかと、手元の dist/ と同じビルドかを確かめる。
# ファイル名とステータスだけを扱い、JS の中身（Firebase の設定値を含む）は表示しない。
#
# 使い方: bash .agents/skills/deploy/scripts/verify-deploy.sh <dev|prod|v1>
set -u

case "${1:-}" in
  dev) site="wadai-de-wadai-dev" ;;
  prod) site="wadai-de-wadai" ;;
  v1) site="wadai-de-wadai-v1" ;;
  *)
    echo "使い方: $0 <dev|prod|v1>" >&2
    exit 2
    ;;
esac

base="https://${site}.web.app"
failed=0

check() {
  local path="$1"
  local code
  code=$(curl -s -o /dev/null -w '%{http_code}' "${base}${path}")
  if [ "$code" = "200" ]; then
    echo "OK   ${code} ${path}"
  else
    echo "NG   ${code} ${path}"
    failed=1
  fi
}

echo "== ${base}"
check "/"
check "/sw.js"
check "/manifest.webmanifest"

# トップページが読み込む JS（ビルドごとにハッシュ付きの名前になる）
remote_assets=$(curl -s "${base}/" | grep -oE '/assets/[^"]+\.js' | sort -u)
if [ -z "$remote_assets" ]; then
  echo "NG   トップページから /assets/*.js が見つからない"
  failed=1
fi
for asset in $remote_assets; do
  check "$asset"
done

# 手元の dist/ と同じビルドかどうか（ファイル名のハッシュで比べる）
repo_root=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
if [ -f "${repo_root}/dist/index.html" ]; then
  local_assets=$(grep -oE '/assets/[^"]+\.js' "${repo_root}/dist/index.html" | sort -u)
  if [ "$local_assets" = "$remote_assets" ]; then
    echo "OK   配信中のビルドは手元の dist/ と一致"
  else
    echo "NG   配信中のビルドが手元の dist/ と違う（別のビルドが出ているか、CDN の反映待ち）"
    failed=1
  fi
else
  echo "--   dist/ がないため、手元のビルドとの比較は省略"
fi

exit "$failed"
