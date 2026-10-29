---
name: pr-workflow
description: ワダイdeワダイで変更をブランチに切り、整形・lint・ビルドで確かめ、コミットして PR を出し、マージまで進める手順。ブランチ名、コミットメッセージ（type: 日本語の件名）、PR 本文の書き方、main の ruleset（PR 必須・CI 必須）への対応を含む。「コミットして」「PR 作って」「push して」「マージしたい」「ブランチ切って」「レビューに出せる状態にして」のような依頼では、明示されていなくても必ずこの skill を使う。コードのレビューそのものや、本番へのリリース（deploy skill）には使わない。
---

# ブランチから PR、マージまで

このリポジトリは公開されていて、`main` と `prod` は ruleset で保護されています（PR 必須・承認 1 件・CI の `ci` が成功していること）。push や PR のコメントは公開され、取り消せません。そのため、**外に出る操作（push、PR の作成と編集、コメント、マージ）の前には、毎回、内容を人に示して承認を得てください。** 1 つ承認されても、次の操作には改めて承認が必要です。マージは人が行います。

## 1. ブランチを切る

`main` を最新にしてから切ります。

```bash
git switch main && git pull --ff-only
git switch -c <接頭辞>/<内容>
```

| 接頭辞      | 使うとき                 |
| ----------- | ------------------------ |
| `feat/`     | 機能の追加               |
| `fix/`      | 不具合の修正             |
| `refactor/` | 動きを変えない整理       |
| `style/`    | 見た目の調整             |
| `docs/`     | 文書だけの変更           |
| `chore/`    | 依存、設定、ビルドまわり |
| `ci/`       | GitHub Actions           |
| `security/` | セキュリティの修正       |

`<内容>` は英小文字とハイフンで短く書きます（例：`fix/event-form-date`）。issue があれば番号を入れます（例：`feat/26-contact-page`）。

## 2. 変更を確かめる

CI と同じ確認を手元で行います。

```bash
npm run format
npm run lint
npm run build:dev
git status --porcelain   # format と lint が直したファイルも、コミットに含める
```

エラーが残ったら、直してから次へ進みます。画面に関わる変更なら、`npm run dev` で画面を確かめてください。デバッグ用の `console.log` やコメントアウトしたコードが差分に残っていないかも確かめます（`git diff`）。

## 3. コミットする

- 話題ごとにコミットを分けます。1 つのコミットには 1 つの理由だけを入れます。
- 書き方は `references/commit-message.md` を読んでください（type の選び方、件名、本文に「なぜ」を書くこと）。
- `.env*` や鍵のファイルを `git add` しないでください。`git add -A` は使わず、ファイルを指定して追加します。

## 4. push して PR を出す（それぞれ承認を得てから）

```bash
git push -u origin <ブランチ名>
gh pr create --base main --title "<件名>" --body-file <本文のファイル>
```

PR の本文は `.github/pull_request_template.md` に沿って書きます。埋め方は `references/pr-body.md` を読んでください。

## 5. CI を待ってマージする

```bash
gh pr checks <番号> --watch
```

CI が落ちたら、ログを読んで直し、同じブランチに push します（push の前に承認を得てください）。

マージは人が行います。承認が付いていないときや、ruleset で止まったときの対応は `references/ruleset.md` を読んでください。

## 結果の報告

最後に、ブランチ名、コミットの一覧、PR の URL、CI の結果、人にしてほしいこと（レビュー、マージ）を報告してください。
