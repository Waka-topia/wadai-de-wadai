import js from '@eslint/js'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import checkFile from 'eslint-plugin-check-file'
import importPlugin from 'eslint-plugin-import'
import jsdoc from 'eslint-plugin-jsdoc'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

export default [
  // ===========================================
  // グローバル無視設定
  // ===========================================
  // ビルド成果物、カバレッジ、依存関係を除外
  {
    ignores: [
      '**/dist/**',
      '**/dist-ssr/**',
      '**/coverage/**',
      '**/node_modules/**',
      'eslint.config.js',
    ],
  },

  // ===========================================
  // JavaScript基本設定
  // ===========================================
  // ESLintの推奨ルールを適用
  js.configs.recommended,

  // ===========================================
  // グローバル環境設定
  // ===========================================
  // ブラウザ環境のグローバル変数を定義
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      import: importPlugin,
    },
  },

  // ===========================================
  // JSDoc設定
  // ===========================================
  // JSDocの推奨ルールを適用し、一部をカスタマイズ
  jsdoc.configs['flat/recommended'],
  {
    rules: {
      // 戻り値の説明は任意とする
      'jsdoc/require-returns': 'off',
      // パラメータの説明は任意とする
      'jsdoc/require-param-description': 'off',
      // パラメータ名と JSDoc の一致は検査しない
      'jsdoc/check-param-names': 'off',
      // Prettierが空行を追加するため、ESLintは空行を許可
      'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
    },
  },

  // ===========================================
  // Vue基本設定
  // ===========================================
  // Vue.jsの推奨ルールを適用
  ...pluginVue.configs['flat/recommended'],

  // ===========================================
  // 共通ルール（すべてのファイルに適用）
  // ===========================================
  {
    files: ['**/*.{js,mjs,jsx,vue}'],
    rules: {
      // -------------------------------------------
      // コメント関連
      // -------------------------------------------
      // コメントの後にはスペースを必須とする
      'spaced-comment': ['error', 'always', { markers: ['/'] }],
      // タスクコメント（todo/fixme）を警告
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme'], location: 'anywhere' }],

      // -------------------------------------------
      // 命名規則
      // -------------------------------------------
      // camelCaseを強制（プロパティ含む）
      camelcase: ['error', { properties: 'always', ignoreDestructuring: false }],
      // アンダースコアで始まる変数名を禁止
      'no-underscore-dangle': 'error',

      // -------------------------------------------
      // インポート/エクスポート
      // -------------------------------------------
      // default export は許可する（store・router・一部の service が使っている）
      'import/no-default-export': 'off',
      // export の位置は問わない
      'import/exports-last': 'off',
      // export文のグループ化は無効
      'import/group-exports': 'off',
      // 重複importを禁止
      'no-duplicate-imports': 'error',

      // -------------------------------------------
      // 関数定義
      // -------------------------------------------
      // 関数宣言とアロー関数式のどちらも許可する
      'func-style': 'off',
      // アロー関数を優先
      'prefer-arrow-callback': 'error',
    },
  },

  // ===========================================
  // Vue専用ルール
  // ===========================================
  {
    files: ['**/*.vue'],
    rules: {
      // -------------------------------------------
      // HTMLコメント
      // -------------------------------------------
      // コメント内のスペースを強制
      'vue/html-comment-content-spacing': ['error', 'always'],
      // コメントのインデントを2スペースに統一
      'vue/html-comment-indent': ['error', 2],

      // -------------------------------------------
      // コンポーネントAPI
      // -------------------------------------------
      // script setupまたはComposition APIのみ許可（既存コードの互換性のため警告レベル）
      'vue/component-api-style': ['warn', ['script-setup', 'composition']],
      // defineProps の書き方が正しいかを検査する
      'vue/valid-define-props': 'error',

      // -------------------------------------------
      // 命名規則
      // -------------------------------------------
      // テンプレート内のコンポーネントはPascalCase
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      // コンポーネント定義名はPascalCase
      'vue/component-definition-name-casing': ['error', 'PascalCase'],
      // コンポーネント名は複数単語を推奨（例外あり）
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['index', 'App', 'default'],
        },
      ],
      // propsはcamelCase
      'vue/prop-name-casing': ['error', 'camelCase'],
      // カスタムイベント名はcamelCase
      'vue/custom-event-name-casing': ['error', 'camelCase'],

      // -------------------------------------------
      // Vue専用の上書き設定
      // -------------------------------------------
      // 変数名はcamelCaseまたはPascalCase（コンポーネント名）を許可
      // URL, IDなどの略語も許可（Firebaseプロパティ名との互換性のため）
      'id-match': [
        'error',
        '^([a-z]+([A-Z][a-z]*)*([A-Z]{2,})?|[A-Z][a-z]+([A-Z][a-z]*)*([A-Z]{2,})?)$', // camelCase または PascalCase（URL, IDなどの略語対応）
        {
          properties: false,
          onlyDeclarations: true,
        },
      ],
    },
  },

  // ===========================================
  // ファイル名チェック
  // ===========================================
  // Vueコンポーネントのファイル名とフォルダ名の規則を強制
  {
    files: ['src/components/**/*.vue', 'src/views/**/*.vue', 'src/pages/**/*.vue'],
    plugins: { 'check-file': checkFile },
    rules: {
      // Vueファイル名はPascalCase（例: UserProfile.vue）
      'check-file/filename-naming-convention': ['error', { '**/*.vue': 'PASCAL_CASE' }],
      // フォルダ名はkebab-case（例: user-profile/）（既存コードの互換性のため警告レベル）
      'check-file/folder-naming-convention': ['warn', { 'src/**/': 'KEBAB_CASE' }],
    },
  },

  // ===========================================
  // vite.config.js専用設定
  // ===========================================
  // PWA manifestのプロパティ名（short_name, theme_color, start_url等）を許可するため
  // プロパティ名のキャメルケース強制を無効化
  {
    files: ['vite.config.js'],
    rules: {
      camelcase: [
        'error',
        {
          properties: 'never',
          ignoreDestructuring: false,
        },
      ],
    },
  },

  // ===========================================
  // Prettier統合
  // ===========================================
  // Prettierと競合するフォーマットルールを無効化（必ず最後に配置）
  skipFormatting,
]
