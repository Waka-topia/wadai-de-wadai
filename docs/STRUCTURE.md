# プロジェクト構造 (Project Structure)

このドキュメントでは `wadai-de-wadai` プロジェクトのディレクトリ構成と、各ディレクトリの役割について説明します。

## ディレクトリ構成図

```text
src/
├── assets/          # 静的アセット (画像、フォントなど)
├── components/      # Vueコンポーネント
│   ├── atoms/       # 原子的な小さなコンポーネント (ボタンなど)
│   ├── molecules/   # atomsを組み合わせたコンポーネント
│   ├── organisms/   # moleculesを組み合わせた独立した機能を持つコンポーネント
│   ├── templates/   # ページのレイアウトを定義するテンプレート (BottomNavigationなど)
│   └── home/        # ホーム画面専用のコンポーネント群 (TrainInfo, BusInfoなど)
├── pages/           # ルーティングに対応するページコンポーネント (Home.vue, LoginPage.vueなど)
├── router/          # Vue Routerの設定 (ルーティング定義)
├── store/           # Vuexストア (状態管理)
├── services/        # API通信やビジネスロジックを扱うサービスモジュール
├── plugins/         # Vuetifyなどのプラグイン設定
├── firebase/        # Firebase初期化・設定関連
├── App.vue          # ルートコンポーネント
└── main.js          # エントリーポイント
```

## 主要ディレクトリの詳細

### `src/pages/`

画面単位のコンポーネントを配置します。`src/router/index.js` でURLと紐付けられます。

- `Home.vue`: メインのホーム画面。
- `LoginPage.vue`: ログイン画面。
- `EventCal.vue`: 新歓日程画面。

### `src/components/`

再利用可能なUIパーツを配置します。

- **`templates/`**:
  - `BottomNavigation.vue`: アプリ下部のナビゲーションバー。
  - `HelloHome.vue`: ホーム画面の挨拶表示など。
- **`home/`**:
  - `TrainInfo.vue`: 電車情報表示セクション。
  - `BusInfo.vue`: バス情報表示セクション。
  - `CampusMap.vue`: キャンパスマップ概要表示。

### `src/store/`

アプリケーション全体の状態管理を行います（認証情報など）。

---

より詳細な開発ガイドラインについては、必要に応じて追記してください。
