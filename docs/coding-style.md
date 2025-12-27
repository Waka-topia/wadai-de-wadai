# コーディングスタイルガイド

このドキュメントは `eslint.config.js` と `.prettierrc.json` の設定を人間が読める形式にまとめたものです。

## 概要

- **Vue 3** + **Composition API**（`<script setup>` 推奨）
- **JavaScript**（TypeScript不使用）
- **セミコロンなし**、**シングルクォート**
- **インデント**: 2スペース
- **行の最大幅**: 100文字

---

## 1. フォーマット（Prettier）

### 基本ルール

- セミコロンなし (`semi: false`)
- シングルクォート (`singleQuote: true`)
- 行の最大幅は100文字 (`printWidth: 100`)

### インポート順序

以下の順序でインポートが自動ソートされます:

1. `vue`
2. `vue-router`
3. `vuex`
4. `vuetify`
5. `firebase`
6. サードパーティモジュール
7. `@/` から始まるエイリアス
8. 相対パス (`./`, `../`)

### プラグイン

- `@ianvs/prettier-plugin-sort-imports`: インポート自動ソート
- `prettier-plugin-jsdoc`: JSDocフォーマット
- `prettier-plugin-organize-attributes`: Vue属性の整列

---

## 2. 命名規則

### ファイル名

- **Vueコンポーネント**: PascalCase（例: `UserProfile.vue`, `EventCard.vue`）
- **フォルダ名**: kebab-case（例: `user-profile/`, `event-card/`）
- **JavaScript**: camelCase（例: `userService.js`, `formatDate.js`）

### 変数・関数名

- **camelCase強制** (`camelcase: error`)
- プロパティもcamelCaseを使用
- **アンダースコア禁止** (`_variable` は NG）

### Vueコンポーネント

- **コンポーネント名**: PascalCase（テンプレート内も `<UserProfile />` 形式）
- **コンポーネント定義名**: PascalCase
- **複数単語必須**（例外: `App`, `index`, `default`）
- **Props**: camelCase（例: `userName`, `isActive`）
- **カスタムイベント**: camelCase（例: `@userClick`, `@updateData`）

---

## 3. インポート/エクスポート

### 禁止事項

- **default export禁止**（Vueファイル以外）

  ```javascript
  // ❌ NG
  export default function myFunction() {}

  // ✅ OK
  export const myFunction = () => {}
  ```

### 推奨事項

- **名前付きexportを使用**
- **export文はファイル末尾に配置** (`import/exports-last`)
- **重複importを禁止**

---

## 4. 関数定義

### 必須ルール

- **関数は式として定義** (`func-style: expression`)

  ```javascript
  // ❌ NG
  function myFunction() {}

  // ✅ OK
  const myFunction = () => {}
  ```

- **アロー関数を優先** (`prefer-arrow-callback`)

  ```javascript
  // ❌ NG
  array.map(function (item) {
    return item * 2
  })

  // ✅ OK
  array.map((item) => item * 2)
  ```

---

## 5. コメント

### JavaScript/Vue

- **コメント後にスペース必須** (`spaced-comment`)

  ```javascript
  // ✅ OK: スペースあり
  //❌ NG: スペースなし
  ```

- **TODO/FIXME は警告レベル**
  ```javascript
  // todo: これは警告が出る
  // fixme: これも警告が出る
  ```

### HTML（Vueテンプレート）

- **コメント内スペース必須**: `<!-- コメント -->`
- **インデントは2スペース**

---

## 6. JSDoc

### 推奨事項

- **関数/メソッドにはJSDocを推奨**
- **パラメータの説明は警告レベル**（必須ではない）
- **戻り値の説明は任意** (`jsdoc/require-returns: off`)
- **パラメータ名の整合性はエラー**

```javascript
/**
 * ユーザー情報を取得する
 *
 * @param {string} userId - ユーザーID
 */
export const fetchUser = (userId) => {
  // 実装
}
```

---

## 7. Vue専用ルール

### API スタイル

- **`<script setup>` または Composition API のみ許可**
- Options API は禁止

```vue
<!-- ✅ OK -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<!-- ❌ NG: Options API -->
<script>
export default {
  data() {
    return { count: 0 }
  },
}
</script>
```

### コンポーネント構造

- **`defineProps` の型チェック必須**
- **`script setup` 内の変数を正しく認識**

---

## 8. 自動チェック

### コマンド

```bash
npm run lint       # ESLintチェック + 自動修正
npm run format     # Prettierフォーマット
```

### Husky（Git Hooks）

- コミット前に自動的にLintとフォーマットが実行されます
- エラーがある場合はコミットできません

---

## 9. 例外・無視設定

### 無視ファイル/ディレクトリ

- `dist/`, `dist-ssr/`, `coverage/`, `node_modules/`
- `eslint.config.js`

---

## まとめ

| 項目         | ルール                         |
| ------------ | ------------------------------ |
| セミコロン   | なし                           |
| クォート     | シングル                       |
| インデント   | 2スペース                      |
| 命名（変数） | camelCase                      |
| 命名（Vue）  | PascalCase                     |
| 関数定義     | アロー関数式                   |
| export       | 名前付きのみ（Vueは除く）      |
| Vue API      | Composition API / script setup |

**疑問があれば、まず `eslint.config.js` と `.prettierrc.json` を確認してください。**
