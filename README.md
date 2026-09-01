# wadai-de-wadai — 2025年4月版 復刻ブランチ

> [!WARNING]
> **このブランチ（`revival/2025-04`）は `main` にマージしないでください。**
>
> 2025年新歓シーズン（〜2025-04-04）に存在した **QRコード読み取り / ランキング / スタンプ一覧**
> を復刻したデモ版です。現行の求人・時間割・シラバス検索・キャンパスマップ・ホームは削除されています。
> デプロイ先も本番とは別の Firebase プロジェクトです。

**Vue 3 + Vuetify + Firebase** で構築されたプログレッシブWebアプリケーション（PWA）

---

## 復刻版でできること

| 機能               | パス          | 概要                                                                  |
| ------------------ | ------------- | --------------------------------------------------------------------- |
| 新歓日程           | `/`           | 新歓イベントのカレンダーと詳細（トップページ）                        |
| QR読み取り         | `/reader`     | 団体のQRコードを読み取ってスタンプを獲得する                          |
| ランキング         | `/ranking`    | スタンプ数の上位100人。表彰台＋リスト表示でリアルタイムに更新される   |
| マイページ         | `/mypage`     | スタンプコレクション（全112種・未取得はグレーアウト）とプロフィール   |
| ログイン・利用規約 | `/login` ほか | 認証、パスワードリセット、利用規約、お問い合わせ、PWAインストール手順 |

### 本家（`main`）から変更した点

- スタンプのマスターは Firestore ではなく `src/data/stamps.js` の静的定義（当時の N+1 クエリを解消）
- ランキングは `rankingEntries` コレクションを取得時に増分更新し、`onSnapshot` で購読（当時の全ユーザー走査バッチと更新ボタンを廃止）
- スタンプ画像 112枚は WebP 化して `public/stamps/` に配置し、PWA のプリキャッシュから除外（21.8MB → 2.5MB）
- 代表者証明・管理画面は削除。すべてのイベントが一般（非公式）扱いになる

---

## クイックスタート

### 前提条件

- **Node.js** 24.x（`mise.toml` / `.node-version` で固定）
- **npm**

### セットアップ

```bash
# 依存関係のインストール
npm ci

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

> QR読み取りにはカメラが必要です。`localhost` か https でのみ動作します
> （`npm run dev -- --host` の `http://192.168.x.x:5173` では拒否されます）。

### 動作確認用のQRコード

```bash
brew install qrencode
qrencode -s 10 -o ~/Desktop/test-stamp.png '{"groupId":"1","stampId":"cir01"}'
```

`stampId` は `src/data/stamps.js` に定義されている 112 種類（`cir01`〜`cir39` / `cre01`〜`cre24` /
`cul01`〜`cul17` / `org01`〜`org06` / `spo01`〜`spo26`）が使えます。

---

## 主な技術スタック

- **Vue 3** (Composition API / `<script setup>`)
- **Vuetify 3** (マテリアルデザインUIフレームワーク)
- **Vite** (高速ビルドツール)
- **Firebase** (認証・Firestore・ホスティング)
- **Vuex** (状態管理)
- **Vue Router** (ルーティング)
- **vue-qrcode-reader** (QRコード読み取り)
- **PWA** (Service Worker対応)

---

## 利用可能なコマンド

| コマンド                       | 説明                                                  |
| ------------------------------ | ----------------------------------------------------- |
| `npm run dev`                  | 開発サーバー起動                                      |
| `npm run build:revival`        | 復刻版ビルド（`.env.revival` を読む）                 |
| `npm run preview`              | ビルド結果をローカルでプレビュー                      |
| `npm run preview:revival`      | 期間限定のプレビューURLへデプロイ（実機確認・共有用） |
| `npm run deploy:revival`       | Firebase Hosting へデプロイ                           |
| `npm run deploy:revival:rules` | Firestore のルールとインデックスをデプロイ            |
| `npm run lint`                 | ESLintチェック + 自動修正                             |
| `npm run format`               | Prettierフォーマット                                  |

> 本番プロジェクト（`wadai-de-wadai`）向けの `deploy:prod` などはこのブランチには存在しません。
> `.firebaserc` からも `prod` / `dev` のエイリアスを外してあります。

---

## ドキュメント

- **[コーディングスタイルガイド](docs/coding-style.md)** - ESLint/Prettier設定の詳細
- **[アーキテクチャ](docs/architecture.md)** - 技術スタックとディレクトリ構造
- **[プロジェクト構造](docs/STRUCTURE.md)** - ディレクトリの役割
- **[開発ワークフロー](docs/workflow.md)** - 開発フロー・コミット規約・CI/CD
- **[CLAUDE.md](CLAUDE.md)** / **[AGENTS.md](AGENTS.md)** - AIエディタ・エージェント向けガイド

---

## ディレクトリ構造（概要）

```
wadai-de-wadai/
├── src/
│   ├── components/
│   │   ├── event/          # 新歓イベント
│   │   ├── my-page/        # マイページ（スタンプコレクション含む）
│   │   ├── qr-reader/      # QR読み取りと獲得演出
│   │   ├── templates/      # 共通レイアウト（ボトムナビ等）
│   │   ├── user-profile/   # プロフィール表示
│   │   └── user-ranking/   # ランキング（表彰台・リスト行）
│   ├── composables/        # useStampCollection / useTopRanking など
│   ├── data/               # groups.js（団体マスター）/ stamps.js（スタンプマスター）
│   ├── pages/              # ページコンポーネント
│   ├── router/             # ルーティング設定
│   ├── services/           # Firestore アクセスとビジネスロジック
│   ├── store/              # Vuex Store（auth / users / event / scroll）
│   ├── firebase/           # Firebase設定
│   └── assets/             # 静的リソース（リボン画像・ユーザーアイコン等）
├── public/
│   └── stamps/             # スタンプ画像 112枚（WebP）
├── docs/                   # ドキュメント
└── dist/                   # ビルド出力
```

---

## コーディング規約

このプロジェクトは厳格なESLint・Prettier設定を使用しています:

- **セミコロンなし**
- **シングルクォート**
- **camelCase強制** (変数・関数)
- **PascalCase強制** (Vueコンポーネント)
- **アロー関数推奨**
- **`<script setup>` 推奨**

詳細は [docs/coding-style.md](docs/coding-style.md) を参照

---

## Git Hooks（Husky）

コミット時に自動的にPrettierフォーマットが実行されます。コミット前に `npm run lint` の実行を推奨します。

---

## 環境変数

復刻版は `.env.revival` を使います（`vite build --mode revival` で読み込まれます）。

```bash
VITE_API_KEY=...
VITE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_PROJECT_ID=<project-id>
VITE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_MESSAGING_SENDER_ID=...
VITE_APP_ID=...
VITE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_ADMIN_UID=<運営アカウントのUID>
```

値は Firebase コンソールの「プロジェクトの設定 → マイアプリ → ウェブアプリ」から取得できます。
