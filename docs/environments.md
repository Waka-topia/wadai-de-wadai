# 環境

## Firebase プロジェクト

| 環境   | Firebase プロジェクト | URL                                | 使うブランチ      | `firebase use` の名前                     |
| ------ | --------------------- | ---------------------------------- | ----------------- | ----------------------------------------- |
| 開発   | `wadai-de-wadai-dev`  | https://wadai-de-wadai-dev.web.app | `main`            | `dev`                                     |
| 本番   | `wadai-de-wadai`      | https://wadai-de-wadai.web.app     | `prod`            | `prod`（`default` も同じ）                |
| 復刻版 | `wadai-de-wadai-v1`   | https://wadai-de-wadai-v1.web.app  | `revival/2025-04` | `revival`（そのブランチの `.firebaserc`） |

プロジェクト名と `firebase use` の対応は [`.firebaserc`](../.firebaserc) にあります。デプロイの手順は skill [`deploy`](../.agents/skills/deploy/SKILL.md) を見てください。

## ブランチ

- `main`：開発の本線。PR はここに向けて出します。dev 環境にデプロイして確認します。
- `prod`：本番に出す内容。`main` から `prod` への PR をマージしてから、本番にデプロイします。
- `revival/2025-04`：2025 年 4 月版を復刻したデモ。`main` にはマージしません。

`main` と `prod` は、PR を通さないと変更できません（ruleset で、承認 1 件と CI の成功が必要）。

## 環境変数

Vite の環境変数として、`VITE_` で始まる名前を使います。値はビルドした JS に埋め込まれてブラウザから見えるので、秘密にすべき値は入れないでください。

| 名前                                                                                                                    | 用途                                            | 使う場所                         |
| ----------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | -------------------------------- |
| `VITE_API_KEY`、`VITE_AUTH_DOMAIN`、`VITE_PROJECT_ID`、`VITE_STORAGE_BUCKET`、`VITE_MESSAGING_SENDER_ID`、`VITE_APP_ID` | Firebase の接続設定                             | `src/firebase/config.js`         |
| `VITE_MAPTILER_API_KEY`                                                                                                 | 地図タイル（MapTiler）                          | `src/composables/useMapLibre.js` |
| `VITE_ADMIN_UID`                                                                                                        | 管理者の UID（[認証と権限](auth-and-roles.md)） | `src/config/constants.js`        |

Firebase の API キーと MapTiler のキーには、配信元のドメインでの制限をかけています。キーを作り直したときは、制限もかけ直してください。

### `.env` ファイルと 1Password

値は 1Password で管理していて、`.env.development`（dev）、`.env.production`（本番）、`.env.revival`（復刻版）として置かれます。ひな形は [`.env.example`](../.env.example) です。

1Password が置く `.env.*` は通常のファイルではなく、named pipe です。Vite は通常のファイルでないものを読み飛ばすので、`npm run dev` と `npm run build:*` は、`cat` で中身を読み出し、`eval` で環境変数にしてから Vite を起動します（[`package.json`](../package.json) の scripts）。sh の `.` は named pipe を読めないので使っていません。

エージェントは `.env*` の中身を読まないでください。キーが会話の記録やログに残るためです。

## 開発環境

- Node.js は [`mise.toml`](../mise.toml) のバージョンを使います。[mise](https://mise.jdx.dev/) で `mise install` を実行すると入ります。CI も [mise-action](https://github.com/jdx/mise-action) で同じファイルを読みます。
- パッケージマネージャーは npm です（`package-lock.json`）。
- `git commit` のたびに、Husky が `npm run format` を実行します（[`.husky/pre-commit`](../.husky/pre-commit)）。lint は実行しないので、コミット前に `npm run lint` を実行してください。

## CI

GitHub Actions で、`main` への push と PR のたびに [`.github/workflows/ci-dev.yml`](../.github/workflows/ci-dev.yml) が動きます。`prod` には [`ci-prod.yml`](../.github/workflows/ci-prod.yml) が動きます。

どちらも、`npm ci` → `npm run format` → `npm run lint` → ビルド の順に実行し、最後に format や lint で差分が出ていないかを確かめます。差分が出たら失敗します。CI には `.env` がないので、ビルドは環境変数なしで行われます。CI で確かめているのはビルドが通ることだけで、動作までは確かめていません。

テストはまだありません。デプロイは CI からは行わず、手元から行います。
