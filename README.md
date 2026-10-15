# ワダイdeワダイ

和歌山大学の学生向けの PWA です。新歓イベントのカレンダー、時間割、みんなで編集するシラバス、キャンパスマップ、電車とバスの発車時刻を、1 つのアプリにまとめています。学生団体 Waka-topia が開発・運営しています。

**デモ：https://wadai-de-wadai.web.app**

## 主な機能

- **新歓カレンダー**：団体が新歓イベントを登録し、新入生が日付から探せます。代表者として認められた団体のイベントは、優先して表示されます。
- **時間割**：学年・学期・クォーターごとに授業を登録し、取得単位を集計します。
- **シラバス検索**：授業の情報を学生どうしで編集し、授業を評価できます。
- **ホーム**：最寄り駅とバス停の、次の発車までの時間と、キャンパスマップを表示します。
- **地図**：キャンパスの地図を表示します。

画面の一覧と、今は使っていない機能については [docs/architecture.md](docs/architecture.md#主な機能) を見てください。

## 技術スタック

Vue 3（`<script setup>`）、Vuetify 3、Vuex 4、Vue Router 4、Vite、vite-plugin-pwa、Firebase（Authentication・Cloud Firestore・Hosting・Analytics）、MapLibre GL（地図タイルは MapTiler）。

バージョンは [`package.json`](package.json) を見てください。独自のサーバーはなく、権限は Firestore のセキュリティルールで守っています。

## セットアップ

1. Node.js を用意します。バージョンは [`.node-version`](.node-version) にあります。[mise](https://mise.jdx.dev/) を使う場合は `mise install` で入ります。
2. 依存を入れます。

   ```bash
   npm ci
   ```

3. 環境変数を用意します。値はチームの 1Password で管理していて、`.env.development` として置かれます。変数の名前と仕組みは [docs/environments.md](docs/environments.md#環境変数) を見てください。
4. 開発サーバーを起動します。

   ```bash
   npm run dev
   ```

エディタは VS Code を想定しています。推奨する拡張機能は [`.vscode/extensions.json`](.vscode/extensions.json) にあります（Vue・ESLint・Prettier・EditorConfig）。

## よく使うコマンド

| コマンド                                     | 内容                                                  |
| -------------------------------------------- | ----------------------------------------------------- |
| `npm run dev`                                | 開発サーバー                                          |
| `npm run format`                             | Prettier で整形する（コミット時にも自動で実行される） |
| `npm run lint`                               | ESLint で検査し、直せるところは直す                   |
| `npm run build:dev` / `npm run build:prod`   | dev 向け / 本番向けのビルド                           |
| `npm run deploy:dev` / `npm run deploy:prod` | ビルドして Firebase Hosting にデプロイする            |

## 文書

| 文書                                             | 内容                                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| [AGENTS.md](AGENTS.md)                           | 作業を始める前に読むもの。守ること、文書と手順の一覧 |
| [docs/architecture.md](docs/architecture.md)     | 層の構成、ディレクトリ、状態管理、ルーティング       |
| [docs/data-model.md](docs/data-model.md)         | Firestore のコレクションと権限                       |
| [docs/auth-and-roles.md](docs/auth-and-roles.md) | 一般ユーザー・団体代表者・管理者                     |
| [docs/environments.md](docs/environments.md)     | Firebase プロジェクト、環境変数、ブランチ、CI        |
| [docs/coding-style.md](docs/coding-style.md)     | lint で検査できない規約                              |

デプロイ、PR、Firestore ルールの変更の手順は、[`.agents/skills/`](.agents/skills) にまとめています。

## 既知の課題

Firestore のセキュリティルールに、ログインしていれば他人のデータを書き換えられる箇所が残っています（団体の代表者、新歓イベントなど）。内容と直し方の方針は [docs/data-model.md](docs/data-model.md#既知の課題) にあります。

## 2025 年 4 月版（復刻）

2025 年の新歓シーズンに公開していた版（QR コードのスタンプラリー、ランキング）を、[`revival/2025-04`](https://github.com/Waka-topia/wadai-de-wadai/tree/revival/2025-04) ブランチで復刻しています。デモは https://wadai-de-wadai-v1.web.app です。
