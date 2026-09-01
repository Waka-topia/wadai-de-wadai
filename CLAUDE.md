# CLAUDE.md - AI エディタ向けガイド

このファイルは **Claude Code** や **Cursor** などのAIエディタ向けのプロジェクトガイドです。

---

## このブランチについて（`revival/2025-04` / v1.0.0）

2025年4月（新歓シーズン）時点の **QRコード読み取り / ランキング / スタンプ一覧** を復刻したブランチです。

- **`main` にマージしないでください。**
- デプロイ先は本番とは別の Firebase プロジェクト（`wadai-de-wadai-v1`）です。
  `.firebaserc` から `dev` / `prod` のエイリアスは意図的に外してあります。
- 環境変数は `.env.revival`（`vite build --mode revival` が読む）。`npm run dev` も `--mode revival` です。
- 求人・時間割・シラバス検索・キャンパスマップ・ホーム・代表者証明・管理画面は**削除済み**です。
  復活させないでください。
- スタンプのマスターは Firestore ではなく `src/data/stamps.js` の静的定義です。
  画像は `public/stamps/{stampId}.webp`（Vite のバンドル対象外）を固定パスで参照します。
- スタンプとランキングは Vuex を使わず、**サービス層 + コンポーザブル**で完結させています。
  新しい Vuex モジュールは追加しないでください。
- `App.vue` の `keep-alive` に `ReaderPage`（カメラが回り続ける）と
  `RankingPage`（`onSnapshot` が解除されない）を**追加しないでください**。

---

## 最重要原則

### 1. ESLint設定を絶対に守る

- このプロジェクトは **厳格なESLint設定** を使用しています
- コード生成時は `eslint.config.js` のルールに**完全に準拠**してください
- 不明な場合は `docs/coding-style.md` を参照

### 2. 常にLintを実行

```bash
npm run lint
```

- コード生成後は**必ず**上記コマンドでチェック
- エラーがある場合は修正してから次に進む

### 3. Prettier設定に従う

- `.prettierrc.json` に定義されたフォーマット規則を守る
- セミコロンなし、シングルクォート、インデント2スペース

---

## クイックリファレンス

### 必須の構文パターン

#### ❌ 禁止パターン

```javascript
// default export禁止（Vueファイル以外）
export default function myFunction() {}

// function宣言禁止
function myFunction() {}

// アンダースコア禁止
const _privateVar = 'value'

// セミコロン禁止（Prettierが自動削除）
const value = 'test'
```

#### ✅ 推奨パターン

```javascript
// 名前付きexport + アロー関数式
export const myFunction = () => {
  // 実装
}

// camelCase
const userName = 'John'

// シングルクォート
const message = 'Hello World'

// コメントはスペース付き
// これは正しいコメント
```

### Vueコンポーネント

#### ❌ 禁止パターン

```vue
<!-- Options API禁止 -->
<script>
export default {
  data() {
    return { count: 0 }
  },
}
</script>

<!-- kebab-caseコンポーネント名禁止 -->
<user-profile />
```

#### ✅ 推奨パターン

```vue
<script setup>
import { ref } from 'vue'

// camelCase変数名
const count = ref(0)

// アロー関数
const increment = () => {
  count.value++
}
</script>

<template>
  <!-- PascalCaseコンポーネント名 -->
  <UserProfile :user-name="name" @user-click="handleClick" />
</template>
```

---

## ファイル作成時のルール

### Vueコンポーネント

- **ファイル名**: PascalCase（例: `UserProfile.vue`）
- **フォルダ名**: kebab-case（例: `user-profile/`）
- **配置場所**:
  - `src/components/`: 再利用可能なコンポーネント
  - `src/pages/`: ページコンポーネント

### JavaScript

- **ファイル名**: camelCase（例: `userService.js`）
- **export**: 名前付きのみ（default export禁止）

---

## インポート順序（自動ソート）

Prettierプラグインにより以下の順序で自動ソートされます:

```javascript
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { VBtn } from 'vuetify/components'
import { getAuth } from 'firebase/auth'
import axios from 'axios' // サードパーティ
import { userService } from '@/services/userService' // @/エイリアス
import { formatDate } from './utils' // 相対パス
```

---

## JSDoc推奨

関数には可能な限りJSDocを記述してください:

```javascript
/**
 * ユーザー情報を取得する
 *
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object>} ユーザー情報
 */
export const fetchUser = async (userId) => {
  // 実装
}
```

---

## コード生成時のチェックリスト

新しいコードを生成したら、以下を確認してください:

- [ ] `npm run lint` でエラーがない
- [ ] default exportを使っていない（Vueファイル以外）
- [ ] function宣言を使っていない（アロー関数式を使用）
- [ ] 変数名がcamelCaseになっている
- [ ] Vueコンポーネント名がPascalCaseになっている
- [ ] アンダースコア(`_`)を使っていない
- [ ] セミコロンがない
- [ ] シングルクォートを使っている
- [ ] コメントにスペースがある（`// コメント`）

---

## よくあるエラーと修正方法

### エラー: `import/no-default-export`

```javascript
// ❌ NG
export default { name: 'test' }

// ✅ OK（Vueファイル以外）
export const config = { name: 'test' }
```

### エラー: `func-style`

```javascript
// ❌ NG
function calculate() {}

// ✅ OK
const calculate = () => {}
```

### エラー: `camelcase`

```javascript
// ❌ NG
const user_name = 'John'

// ✅ OK
const userName = 'John'
```

### エラー: `no-underscore-dangle`

```javascript
// ❌ NG
const _privateVar = 'value'

// ✅ OK
const privateVar = 'value'
```

---

## プロジェクト構造

### サービス層を優先

- コンポーネントから直接Firebaseを呼ばない
- `src/services/` にビジネスロジックを配置

```javascript
// ✅ 推奨パターン
// src/services/userService.js
import { doc, getDoc, getFirestore } from 'firebase/firestore'
// src/components/UserProfile.vue
import { fetchUserById } from '@/services/userService'

export const fetchUserById = async (userId) => {
  const db = getFirestore()
  const userDoc = await getDoc(doc(db, 'users', userId))
  return userDoc.data()
}

const loadUser = async () => {
  const user = await fetchUserById('123')
}
```

---

## 環境変数

- Viteプロジェクトなので `VITE_` プレフィックスを使用
- `.env` ファイルに設定

```bash
VITE_FIREBASE_API_KEY=your_api_key
```

```javascript
// 使用例
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
```

---

## トラブルシューティング

### Lintエラーが大量に出る

1. `npm run lint` で自動修正を試す
2. それでもエラーが残る場合は `docs/coding-style.md` を参照
3. `eslint.config.js` で該当ルールを確認

### インポート順序がバラバラ

```bash
npm run format
```

Prettierが自動的に正しい順序にソートします

---

## 参考ドキュメント

- **コーディング規約の詳細**: `docs/coding-style.md`
- **アーキテクチャ**: `docs/architecture.md`
- **開発ワークフロー**: `docs/workflow.md`

---

## 最後に

**常に `npm run lint` を実行してください。**

エラーがある状態でコードを提供しないでください。
