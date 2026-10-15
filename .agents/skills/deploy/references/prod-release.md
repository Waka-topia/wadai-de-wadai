# 本番へのリリース（main → prod）

本番には、`prod` ブランチの内容を出します。`main` を直接本番に出さないのは、何を本番に出したかを `prod` の履歴に残し、CI（`ci-prod.yml`）を通った状態だけを出すためです。`prod` は ruleset で保護されていて、PR と CI の成功が必要です。

## 手順

1. 本番に入る変更を確かめて、人に示します。

   ```bash
   git fetch origin
   git log --oneline --merges origin/prod..origin/main   # 入る PR の一覧
   git diff --stat origin/prod origin/main -- firestore.rules firestore.indexes.json   # ルールとインデックスの差分
   ```

   リリースは `main` の全体を出すので、特定の機能だけを選んでは出せません。依頼が 1 つの機能だけを指していても、一覧にあるほかの変更も一緒に出ることを人に伝えてください。

   **ルールかインデックスに差分があれば、Hosting だけでなくルールも出す必要があります。** `npm run deploy:prod` は Hosting しか出さないので、新しい画面が新しいルールを前提にしていると、本番で permission-denied になります。手順 5 で、Hosting より先にルールを出します（`references/rules-deploy.md` の手順 3）。

2. 人の承認を得てから、リリースの PR を作ります。タイトルは `release: YYYY-MM-DD` にし、本文には手順 1 の一覧を貼ります。

   ```bash
   gh pr create --base prod --head main --title "release: 2026-10-20" --body "<入る PR の一覧>"
   ```

3. CI（check 名 `ci`）が通るのを待ちます。`gh pr checks <番号> --watch` で確かめられます。

4. マージは人が行います。merge commit を使うよう伝えてください。承認が付いていないときは、admin が `! gh pr merge <番号> --merge --admin` で迂回できます。squash は使いません（`main` と `prod` の履歴がずれて、次のリリースで差分が正しく出なくなるため）。

5. マージされたら、`prod` を手元に取り込んでデプロイします（SKILL.md の手順 2〜4）。手順 1 でルールかインデックスに差分があったら、Hosting より先にルールを出します（それぞれ承認を得てから）。

   ```bash
   git switch prod && git pull --ff-only
   ```

   作業ツリーに未コミットの変更があると切り替えられません。退避するかどうかは人に聞いてください。`git worktree` で別のディレクトリに `prod` を取り出す方法は使えません。1Password の `.env.*` はリポジトリのディレクトリにしか置かれないので、ビルドに環境変数が入らないためです。

6. デプロイしたら、`main` に戻ります（`git switch main`）。

## 初めて立て直すとき（2026-10 時点）

`prod` は 2026-04 から更新されておらず、`main` より 170 コミット以上遅れています。また、`ci-prod.yml` も `prod` にはまだありません。PR の CI は `main` 側の `ci-prod.yml` で動くので、手順は上と同じです。差分が大きいので、マージの前に dev で主な画面を確認したかを人に聞いてください。
