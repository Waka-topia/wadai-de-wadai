# AGENTS.md - 自律型エージェント向けガイド

このファイルは **自律型AIエージェント** がプロジェクトに貢献する際のガイドラインです。

---

## ミッション

プロジェクトの**型定義、Lintルール、アーキテクチャパターン**を破壊せず、既存のコード品質を維持しながら改善・拡張を行う。

---

## 最優先ルール

### 🚨 破壊禁止項目

以下のファイル・設定は**絶対に変更・削除しないでください**:

1. **`eslint.config.js`** - ESLint設定
2. **`.prettierrc.json`** - Prettier設定
3. **`package.json`** - 依存関係（追加のみ許可、削除は禁止）
4. **`vite.config.js`** - Viteビルド設定
5. **型定義や既存のAPI**（互換性を破壊しない）

### ✅ 変更前の必須チェック

新しいコードを追加する前に:

1. **`eslint.config.js`** を読んで、すべてのルールを理解する
2. **`docs/coding-style.md`** を読んで、コーディング規約を確認
3. **`docs/architecture.md`** を読んで、既存のパターンを把握
4. 既存のコードを検索・確認し、同じパターンを踏襲する

---

## コード生成プロトコル

### ステップ1: 調査フェーズ

```bash
# 類似する既存コードを検索
grep -r "関連キーワード" src/

# 既存のサービス層を確認
ls src/services/

# 既存のコンポーネントを確認
ls src/components/
```

### ステップ2: 設計フェーズ

- 既存のアーキテクチャパターンに従う
- 新しいパターンを導入しない（既存のパターンで解決できる場合）
- サービス層、コンポーネント層の責務を明確にする

### ステップ3: 実装フェーズ

- ESLintルールに**完全準拠**したコードを生成
- Prettierフォーマット規則を守る
- JSDocコメントを記述する

### ステップ4: 検証フェーズ

```bash
# Lint実行（必須）
npm run lint

# フォーマット実行
npm run format

# ビルド確認
npm run build
```

**Lintエラーがある場合、次のステップに進まない**

---

## 命名規則（厳格）

### ファイル名

| タイプ                     | 命名規則   | 例                |
| -------------------------- | ---------- | ----------------- |
| Vueコンポーネント          | PascalCase | `UserProfile.vue` |
| JavaScript                 | camelCase  | `userService.js`  |
| フォルダ（components配下） | kebab-case | `user-profile/`   |

### 変数・関数名

| タイプ | 命名規則                         | 例                         |
| ------ | -------------------------------- | -------------------------- |
| 変数   | camelCase                        | `userName`, `isActive`     |
| 関数   | camelCase                        | `fetchUser`, `handleClick` |
| 定数   | camelCase（UPPER_SNAKEではない） | `apiEndpoint`              |

### Vue固有

| タイプ                       | 命名規則   | 例                          |
| ---------------------------- | ---------- | --------------------------- |
| Props                        | camelCase  | `userName`, `isLoading`     |
| Events                       | camelCase  | `@userClick`, `@dataUpdate` |
| コンポーネント（template内） | PascalCase | `<UserProfile />`           |

---

## 構文規則（厳格）

### JavaScript

#### 関数定義

```javascript
// ❌ 絶対NG
function myFunction() {}

// ✅ 必須パターン
export const myFunction = () => {}
export const myFunction = (param) => {
  // 実装
}
```

#### Export

```javascript
// ❌ 絶対NG（Vueファイル以外）
export default myFunction

// ✅ 必須パターン
export const myFunction = () => {}
export const myConfig = { ... }
```

#### 禁止事項

```javascript
// ❌ アンダースコア禁止
const _privateVar = 'value'

// ❌ セミコロン禁止（Prettierが削除）
const value = 'test'

// ❌ ダブルクォート禁止
const message = 'Hello'

// ❌ スペースなしコメント禁止
//コメント
```

### Vue

#### API スタイル

```vue
<!-- ❌ 絶対NG: Options API -->
<script>
export default {
  data() {
    return {}
  },
}
</script>

<!-- ✅ 必須パターン: script setup -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>
```

---

## インポート順序（自動ソート）

```javascript
// 以下の順序で自動ソート（.prettierrc.jsonで定義）
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { VBtn } from 'vuetify/components'
import { getAuth } from 'firebase/auth'
import thirdPartyLib from 'third-party-lib'
import { userService } from '@/services/userService'
import { localUtil } from './localUtil'
```

---

## アーキテクチャパターン

### サービス層の使用（必須）

コンポーネントから直接Firebaseや外部APIを呼ばず、**必ず`src/services/`を経由**:

```javascript
// ❌ コンポーネントで直接呼ぶのはNG
<script setup>
import { getFirestore, doc, getDoc } from 'firebase/firestore'

const loadUser = async () => {
  const db = getFirestore()
  const userDoc = await getDoc(doc(db, 'users', '123'))
}
</script>

// ✅ サービス層経由
// src/services/userService.js
import { getFirestore, doc, getDoc } from 'firebase/firestore'

export const fetchUserById = async (userId) => {
  const db = getFirestore()
  const userDoc = await getDoc(doc(db, 'users', userId))
  return userDoc.data()
}

// src/components/UserProfile.vue
<script setup>
import { fetchUserById } from '@/services/userService'

const loadUser = async () => {
  const user = await fetchUserById('123')
}
</script>
```

### ディレクトリ配置ルール

```
src/
├── components/      # 再利用可能なUIコンポーネント（ビジネスロジックなし）
├── pages/           # ページコンポーネント（ルートに対応）
├── services/        # ビジネスロジック・API呼び出し
├── store/           # Vuex Store（グローバル状態管理）
├── router/          # Vue Router設定
├── firebase/        # Firebase初期化・設定
└── data/            # 静的データ・定数
```

---

## JSDoc（推奨）

すべての関数にJSDocを記述:

```javascript
/**
 * ユーザー情報を取得する
 *
 * @param {string} userId - ユーザーID
 * @returns {Promise<Object>} ユーザー情報
 */
export const fetchUserById = async (userId) => {
  // 実装
}
```

---

## コミットメッセージ規約

```
<type>: <subject>

Type:
- feat: 新機能
- fix: バグ修正
- refactor: リファクタリング
- docs: ドキュメント更新
- style: コードスタイル修正
- test: テスト追加
- chore: ビルド・設定変更
```

---

## 自動チェックの実行

### コード生成後の必須コマンド

```bash
# 1. Lintチェック + 自動修正
npm run lint

# 2. フォーマット
npm run format

# 3. ビルド確認
npm run build
```

**これらのコマンドがすべて成功するまで、コードをコミットしない**

---

## エラーハンドリング

### よくあるLintエラー

#### `import/no-default-export`

```javascript
// ❌ NG
export default function () {}

// ✅ OK（Vueファイル以外）
export const myFunction = () => {}
```

#### `func-style`

```javascript
// ❌ NG
function myFunction() {}

// ✅ OK
const myFunction = () => {}
```

#### `camelcase`

```javascript
// ❌ NG
const user_name = 'test'

// ✅ OK
const userName = 'test'
```

#### `no-underscore-dangle`

```javascript
// ❌ NG
const _privateVar = 'value'

// ✅ OK
const privateVar = 'value'
```

#### `vue/component-api-style`

```vue
<!-- ❌ NG -->
<script>
export default { data() {} }
</script>

<!-- ✅ OK -->
<script setup>
import { ref } from 'vue'
</script>
```

---

## 互換性維持

### 既存APIの変更禁止

既存の関数シグネチャを変更しない:

```javascript
// ❌ 既存の関数を変更するのはNG
// Before: export const fetchUser = (id) => {}
// After: export const fetchUser = (userId, options) => {}  // 破壊的変更

// ✅ 新しい関数を追加
export const fetchUser = (id) => {} // 既存を維持
export const fetchUserWithOptions = (userId, options) => {} // 新規追加
```

### Vuexストアの変更

既存のストアモジュール構造を維持:

```javascript
// ❌ 既存のstateプロパティを削除・リネームするのはNG

// ✅ 新しいプロパティを追加（既存は維持）
```

---

## セキュリティ

### 環境変数の使用

```javascript
// ✅ OK: Viteの環境変数プレフィックス
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY

// ❌ NG: ハードコード
const apiKey = 'AIza...' // 絶対にコミットしない
```

---

## パフォーマンス

### 動的インポート（Code Splitting）

```javascript
// ✅ 大きなライブラリは動的インポート
const loadHeavyLib = async () => {
  const { heavyFunction } = await import('./heavyLib')
  return heavyFunction()
}
```

---

## テスト（将来的な拡張）

現在テストフレームワークは未導入ですが、追加する場合:

- **Vitest** を推奨（Viteとの互換性）
- テストファイルは `*.spec.js` または `*.test.js`

---

## 緊急時の対処

### Lintエラーが解決できない場合

1. `eslint.config.js` で該当ルールを確認
2. `docs/coding-style.md` で正しいパターンを確認
3. 既存コードで同様のパターンを検索
4. それでも解決できない場合は、人間の開発者に確認を依頼

### ビルドエラーが発生した場合

1. `npm run lint` でLintエラーを修正
2. `npm run format` でフォーマットを修正
3. `npm run build` を再実行

---

## 最終チェックリスト

コードをコミットする前に:

- [ ] `eslint.config.js` のルールに準拠している
- [ ] `npm run lint` でエラーがない
- [ ] `npm run format` を実行した
- [ ] `npm run build` が成功する
- [ ] 既存のAPIを破壊していない
- [ ] JSDocコメントを記述した
- [ ] サービス層を使用している
- [ ] 命名規則に準拠している
- [ ] default exportを使っていない（Vueファイル以外）
- [ ] アロー関数式を使用している

---

## 参考ドキュメント

- **ESLint設定**: `eslint.config.js`
- **Prettier設定**: `.prettierrc.json`
- **コーディングスタイル**: `docs/coding-style.md`
- **アーキテクチャ**: `docs/architecture.md`
- **ワークフロー**: `docs/workflow.md`

---

## まとめ

**ESLintルールを絶対に守り、既存のパターンを踏襲し、すべてのチェックを通過してからコミットする。**
