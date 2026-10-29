# AGENTS.md

このリポジトリで作業する人とエージェントが、最初に読む文書です。詳しいことは、下の「文書の地図」にあるリンク先に書いてあります。同じことを 2 か所に書かないために、この文書には要点とリンクだけを置いています。

## このプロジェクト

ワダイdeワダイは、和歌山大学の学生向けの PWA です。新歓イベントのカレンダー、時間割、みんなで編集するシラバス、キャンパスマップ、電車とバスの発車時刻をまとめています。Vue 3 + Vuetify + Vuex で作り、バックエンドは Firebase（Authentication・Firestore・Hosting）だけです。

## コマンド

コマンドの一覧は [README.md](README.md#よく使うコマンド) にあります。間違えやすい点だけを書きます。

- `npm run build` と `npm test` はありません。ビルドは `npm run build:dev`（CI と同じ確認）、テストはまだありません。
- `npm run dev` と `npm run build:*` は、1Password の `.env.*` を読みます。`vite` を直接実行すると環境変数が入りません（[docs/environments.md](docs/environments.md#env-ファイルと-1password)）。

## 作業するときに守ること

- **コードを変えたら `npm run format` と `npm run lint` を実行し、エラーがない状態にしてください。** CI も同じ検査をし、差分やエラーがあると失敗します。書式と lint の規約は設定ファイルが正本なので、文書では説明しません。
- **Firebase の SDK は `src/services/` からだけ呼んでください。** 画面や store から直接呼ぶと、データの形を変えるときに見る場所が散らばります。
- **権限はクライアントでなく `firestore.rules` で守ってください。** このリポジトリは公開されているので、ルールの穴は誰でも見つけられます。ルールを変えたら `docs/data-model.md` も直してください。
- **`.env*`、API キー、環境変数の値を読んだり、表示したりしないでください。** `.env.example` も含みます。会話の記録やログにキーが残るためです。設定の確認が必要なときは、人に管理画面で確かめてもらってください。
- **外に影響する操作は、1 つずつ人の承認を得てから行ってください。** 対象は、push、PR の作成やコメント、デプロイ、GitHub や Firebase の設定変更です。公開リポジトリと本番環境への影響は、取り消せないことがあります。マージは人が行います。
- 既存の部品（`BaseBottomSheet`、`useFormSubmit`、`useSnackbar` など）で済むときは、新しく作らないでください。一覧は `docs/coding-style.md` にあります。
- 画面から使っていない機能（求人、スタンプと QR、施設評価）のコードは、今後戻す予定があるので消さないでください。

## 文書の地図

| 知りたいこと                                               | 文書                                             |
| ---------------------------------------------------------- | ------------------------------------------------ |
| 何のアプリか、セットアップ                                 | [README.md](README.md)                           |
| 層の構成、ディレクトリ、状態管理、ルーティング、機能一覧   | [docs/architecture.md](docs/architecture.md)     |
| Firestore のコレクション、フィールド、権限、既知の穴       | [docs/data-model.md](docs/data-model.md)         |
| 一般ユーザー・団体代表者・管理者の権限と、代表者になる流れ | [docs/auth-and-roles.md](docs/auth-and-roles.md) |
| Firebase プロジェクト、URL、環境変数、ブランチ、CI         | [docs/environments.md](docs/environments.md)     |
| lint で検査できない規約                                    | [docs/coding-style.md](docs/coding-style.md)     |

## 手順（skills）

繰り返す手順は skill にしています。人が読むときも、同じファイルを読んでください。

| skill                                                                      | 使うとき                                           |
| -------------------------------------------------------------------------- | -------------------------------------------------- |
| [`deploy`](.agents/skills/deploy/SKILL.md)                                 | dev や本番へのデプロイ、Firestore ルールのデプロイ |
| [`pr-workflow`](.agents/skills/pr-workflow/SKILL.md)                       | ブランチ作成、コミット、PR、マージ                 |
| [`firestore-rules-change`](.agents/skills/firestore-rules-change/SKILL.md) | `firestore.rules` の変更                           |

## エージェント向けの設定の置き場所

- 指示はこの `AGENTS.md` だけに書きます。`CLAUDE.md` は置きません（`CLAUDE.md` があると、Claude Code は `AGENTS.md` を読まなくなります）。Claude Code で読み込むには v2.1.277 以降が必要です。
- skills の正本は `.agents/skills/` です。Codex・Cursor・GitHub Copilot はここを読みます。
- 特定のファイルを触ったときだけ読み込む指示は `.agents/rules/` に置きます（Claude Code の rules の形式。`paths` で対象を指定）。
- Claude Code 向けに、`.claude/skills` と `.claude/rules` は `.agents/` への symlink にしています。Windows で clone するときは、git の symlink を有効にしてください（`git config core.symlinks true`）。
- `.claude/settings.local.json` と `.claude/plans/` は個人の設定なので、リポジトリには入れません。
