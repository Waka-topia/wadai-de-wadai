# wadai-de-wadai

**Vue 3 + Vuetify + Firebase** で構築されたプログレッシブWebアプリケーション（PWA）

---

## クイックスタート

### 前提条件
- **Node.js** 18.x 以上
- **npm** または **yarn**

### セットアップ
```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

---

## 主な技術スタック

- **Vue 3** (Composition API / `<script setup>`)
- **Vuetify 3** (マテリアルデザインUIフレームワーク)
- **Vite** (高速ビルドツール)
- **Firebase** (認証・データベース・ホスティング)
- **Vuex** (状態管理)
- **Vue Router** (ルーティング)
- **Leaflet / Mapbox GL** (地図表示)
- **PWA** (Service Worker対応)

---

## 利用可能なコマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLintチェック + 自動修正 |
| `npm run format` | Prettierフォーマット |

---

## ドキュメント

プロジェクトの詳細は以下のドキュメントを参照してください:

### 人間向け
- **[コーディングスタイルガイド](docs/coding-style.md)** - ESLint/Prettier設定の詳細
- **[アーキテクチャ](docs/architecture.md)** - 技術スタックとディレクトリ構造
- **[開発ワークフロー](docs/workflow.md)** - 開発フロー・コミット規約・CI/CD

### AI向け
- **[CLAUDE.md](CLAUDE.md)** - AIエディタ向けガイド（Claude Code等）
- **[AGENTS.md](AGENTS.md)** - 自律型エージェント向けガイド

---

## ディレクトリ構造（概要）

```
wadai-de-wadai/
├── src/
│   ├── components/     # 再利用可能なUIコンポーネント
│   ├── pages/          # ページコンポーネント
│   ├── router/         # ルーティング設定
│   ├── store/          # Vuex Store
│   ├── services/       # ビジネスロジック
│   ├── firebase/       # Firebase設定
│   └── assets/         # 静的リソース
├── docs/               # ドキュメント
├── dist/               # ビルド出力
└── public/             # 静的ファイル
```

詳細は [docs/architecture.md](docs/architecture.md) を参照

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

コミット時に自動的にLint・フォーマットが実行されます:
- エラーがある場合、コミットが中断されます
- 手動で `npm run lint` を実行して事前にチェック可能

---

## 環境変数

`.env` ファイルを作成してFirebase設定を追加:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# ...その他のFirebase設定
```

---

## デプロイ

### Firebase Hosting
```bash
# ビルド
npm run build

# デプロイ（Firebase CLI必要）
firebase deploy --only hosting
```

---

## トラブルシューティング

### ESLintエラーでコミットできない
```bash
npm run lint  # エラーを確認・自動修正
```

### Huskyが動作しない
```bash
npm run prepare  # Huskyを再初期化
```

---

## ライセンス

Private

---

## コントリビューション

プルリクエストを作成する前に:
1. [docs/coding-style.md](docs/coding-style.md) に準拠していることを確認
2. `npm run lint` でエラーがないことを確認
3. ブラウザで動作確認

詳細は [docs/workflow.md](docs/workflow.md) を参照
