# 開発ワークフロー

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd wadai-de-wadai
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env` ファイルを作成し、Firebase設定を追加:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
# その他のFirebase設定...
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` にアクセス

---

## 日常的な開発フロー

### 1. ブランチ戦略

```bash
# 新機能開発
git switch -b feature/機能名

# バグ修正
git switch -b fix/バグ名

# ドキュメント更新
git switch -b docs/更新内容
```

### 2. コード作成

- **`docs/coding-style.md`** に従って実装
- ESLintの警告に従う（保存時に自動修正）

### 3. コミット前チェック

```bash
# 手動でLintを実行
npm run lint

# 手動でフォーマット
npm run format
```

**注意**: Huskyが設定されているため、コミット時に自動的にLint・フォーマットが実行されます。

### 4. コミット

```bash
git add .
git commit -m "feat: 新機能の追加"
```

**Huskyによる自動チェック**:

- `prepare` フックでHuskyが初期化される
- コミット前にLint・フォーマットが自動実行される
- エラーがある場合、コミットが中断される

### 5. プッシュ・マージ

```bash
git push origin feature/機能名
# プルリクエストを作成してレビュー依頼
```

---

## コマンド一覧

### 開発

| コマンド            | 説明                         |
| ------------------- | ---------------------------- |
| `npm run dev`       | 開発サーバー起動（HMR有効）  |
| `npm run build:dev` | 本番ビルド（`dist/` に出力） |
| `npm run preview`   | ビルド結果をプレビュー       |

### コード品質

| コマンド         | 説明                      |
| ---------------- | ------------------------- |
| `npm run lint`   | ESLintチェック + 自動修正 |
| `npm run format` | Prettierでフォーマット    |

### その他

| コマンド          | 説明                    |
| ----------------- | ----------------------- |
| `npm run prepare` | Husky初期化（自動実行） |

---

## コミットメッセージ規約

### 推奨フォーマット

```
<type>: <subject>

<body>（オプション）

<footer>（オプション）
```

### Type一覧

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正（機能変更なし）
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド・設定変更

### 例

```bash
git commit -m "feat: ユーザーランキング表示機能を追加"
git commit -m "fix: ログイン時のエラーハンドリングを修正"
git commit -m "docs: README.mdにセットアップ手順を追加"
```

---

## CI/CD（推奨設定）

### GitHub Actions（例）

```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version-file: '.node-version'
      - run: npm ci
      - run: npm run build
```

---

## ESLint・Prettierの自動修正

### VSCodeの推奨設定

`.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": ["javascript", "vue"]
}
```

### 推奨拡張機能

- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier** (`esbenp.prettier-vscode`)
- **Vetur** または **Volar** (Vue 3推奨)

---

## トラブルシューティング

### ESLintエラーでコミットできない

```bash
# 手動でエラーを確認
npm run lint

# 自動修正を試す
npm run lint

# それでもエラーが残る場合、手動で修正
```

### Prettierとの競合

- ESLintとPrettierの競合は `@vue/eslint-config-prettier/skip-formatting` で自動的に解決されます
- 両方のツールを同時に実行しても問題ありません

### Huskyが動作しない

```bash
# Huskyを再初期化
npm run prepare
```

---

## 新機能追加の流れ

### 1. 計画・設計

- 要件を明確化
- `docs/architecture.md` を確認し、既存パターンに従う

### 2. 実装

```bash
# ブランチ作成
git checkout -b feature/新機能名

# サービス層を作成
touch src/services/新機能Service.js

# コンポーネントを作成
touch src/components/新機能/NewComponent.vue
```

### 3. コード品質チェック

```bash
npm run lint
npm run format
```

### 4. テスト（手動）

```bash
npm run dev
# ブラウザで動作確認
```

### 5. コミット・プッシュ

```bash
git add .
git commit -m "feat: 新機能の追加"
git push origin feature/新機能名
```

---

## レビュー基準

### プルリクエストの前に確認

- [ ] ESLint・Prettierのエラーがない
- [ ] `docs/coding-style.md` に準拠している
- [ ] 既存のアーキテクチャパターンに従っている
- [ ] コメント（JSDoc）が適切に記載されている
- [ ] 不要なconsole.log等が残っていない
- [ ] ブラウザで動作確認済み

---

## デプロイ

### Firebase Hostingへのデプロイ

```bash
# ビルド
npm run build:dev

# Firebaseデプロイ（Firebase CLIが必要）
firebase deploy --only hosting

or

npm run deploy:dev
```

---

## 参考

- **コーディング規約**: `docs/coding-style.md`
- **アーキテクチャ**: `docs/architecture.md`
- **AI向けガイド**: `CLAUDE.md`, `AGENTS.md`
