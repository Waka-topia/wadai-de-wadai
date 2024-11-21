# wadai-de-wadai

This template should help get you started developing with Vue 3 in Vite.

project-root/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── assets/
│   │   └── images/        # アプリ内で使用する画像ファイルを格納
│   ├── components/
│   │   ├── QRScanner.vue # QRコード読み取り機能のコンポーネント
│   │   ├── MapView.vue   # 学内マップ表示コンポーネント
│   │   ├── Ranking.vue   # ランキング表示コンポーネント
│   │   ├── Titles.vue    # 称号一覧表示コンポーネント
│   │   └── UserStatus.vue # ユーザーの次の予定を表示するコンポーネント
│   ├── layouts/
│   │   ├── DefaultLayout.vue # ヘッダーやフッターを含む共通レイアウト
│   │   └── AuthLayout.vue    # 認証画面専用のレイアウト
│   ├── pages/
│   │   ├── Home.vue       # ホーム画面
│   │   ├── Login.vue      # ログイン画面
│   │   ├── SignUp.vue     # サインアップ画面
│   │   ├── Dashboard.vue  # ダッシュボード画面（スタンプや称号を確認できる画面）
│   │   ├── EventDetails.vue # イベントの詳細を表示する画面
│   │   └── MapExplorer.vue # マップの詳細を表示する画面
│   ├── router/
│   │   └── index.js       # ルーティング設定
│   ├── store/
│   │   └── index.js       # Vuexストア設定（状態管理用）
│   ├── utils/
│   │   ├── firebase.js    # Firebaseの初期化設定
│   │   ├── mapUtils.js    # マップ関連のユーティリティ関数
│   │   └── qrUtils.js     # QRコード関連のユーティリティ関数
│   ├── App.vue            # アプリ全体のルートコンポーネント
│   └── main.js            # アプリのエントリーポイント
├── .env                   # 環境変数（Firebase APIキーなどを設定）
├── .gitignore             # Git管理対象外のファイル指定
├── package.json           # プロジェクトの依存関係とスクリプト
└── README.md              # プロジェクトの概要と使用方法

## 各ディレクトリとファイルの説明

/public
アプリケーションの静的ファイルを配置します。
index.html: アプリのエントリーポイントとなるHTMLファイル。

/src
    /assets
    画像やロゴなどの静的ファイルを配置します。

/components
再利用可能なVueコンポーネントを格納します。
    QRScanner.vue: QRコードをスキャンする機能を提供。
    MapView.vue: 学内マップを表示するためのコンポーネント。
    Ranking.vue: ユーザーのランキングを表示するコンポーネント。
    Titles.vue: 称号を一覧表示するコンポーネント。
    UserStatus.vue: 他のユーザーの次のイベント予定を表示する機能。

/layouts
複数ページで共通して使用するレイアウトコンポーネントを配置します。

/pages
各画面ごとのVueコンポーネントを配置します。
例: Home.vue、Login.vue、Dashboard.vue

/router
Vue Routerの設定を格納します。
    index.js: 各ページのルート定義を記述。

/store
Vuexを使用した状態管理の設定を格納します。
    index.js: スタンプや称号などのアプリ全体の状態を管理。

/utils
ユーティリティ関数やAPI設定を格納します。
    firebase.js: Firebaseサービスの初期化処理。
    mapUtils.js: マップ機能に関連する補助関数。
    qrUtils.js: QRコードのデータ処理関連の関数。


## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
