# アーキテクチャ

## 技術スタック

### フロントエンド

- **Vue 3.5.12** - プログレッシブフレームワーク
- **Vuetify 3.7.4** - マテリアルデザインUIフレームワーク
- **Vue Router 4.4.5** - 公式ルーター
- **Vuex 4.0.2** - 状態管理

### ビルド/開発ツール

- **Vite 6.0.0** - 高速ビルドツール
- **Vite PWA Plugin** - Progressive Web App対応

### バックエンド/インフラ

- **Firebase 11.0.2** - 認証・データベース・ホスティング
- **Service Worker** - オフライン対応・プッシュ通知

### UI/UX

- **Leaflet 1.9.4** - 地図表示（OpenStreetMap）
- **Mapbox GL 3.8.0** - 高度な地図機能
- **QRコードリーダー** (`vue-qrcode-reader`, `jsqr`)
- **Font Awesome & MDI** - アイコンライブラリ

### ユーティリティ

- **Turf.js** - 地理空間解析
- **bcryptjs** - パスワードハッシュ化
- **uuid** - 一意識別子生成

---

## ディレクトリ構造

```
wadai-de-wadai/
├── src/
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   ├── EditForm/     # 編集フォーム関連
│   │   ├── Event/        # イベント関連
│   │   ├── MyPage/       # マイページ関連
│   │   ├── UserRanking/  # ユーザーランキング関連
│   │   ├── icons/        # カスタムアイコン
│   │   └── templates/    # テンプレートコンポーネント
│   ├── pages/            # ページコンポーネント（ルートに対応）
│   ├── router/           # Vue Router設定
│   ├── store/            # Vuex Store
│   │   └── modules/      # Vuexモジュール
│   ├── services/         # ビジネスロジック・API呼び出し
│   ├── firebase/         # Firebase設定・初期化
│   ├── plugins/          # Vueプラグイン（Vuetify等）
│   ├── data/             # 静的データ・定数
│   ├── assets/           # 静的リソース
│   │   ├── rankings/     # ランキング画像
│   │   ├── stamps/       # スタンプ画像
│   │   └── userIcon/     # ユーザーアイコン
│   ├── App.vue           # ルートコンポーネント
│   ├── main.js           # エントリーポイント
│   └── registerServiceWorker.js  # Service Worker登録
├── public/               # 静的ファイル（そのままコピーされる）
├── dist/                 # ビルド出力先
├── docs/                 # ドキュメント
├── eslint.config.js      # ESLint設定（Flat Config形式）
├── .prettierrc.json      # Prettier設定
├── vite.config.js        # Vite設定
├── jsconfig.json         # JavaScript設定（パスエイリアス等）
└── package.json          # 依存関係・スクリプト
```

---

## アーキテクチャパターン

### コンポーネント設計

- **Atomic Design風の階層構造**
  - `components/`: 再利用可能なコンポーネント
  - `pages/`: ページ単位のコンポーネント
  - `templates/`: レイアウトテンプレート

### 状態管理（Vuex）

- **モジュール分割** (`store/modules/`)
- グローバルな状態（ユーザー情報、認証状態等）を管理

### ルーティング（Vue Router）

- **ページベースのルーティング**
- `pages/` 内の各コンポーネントがルートに対応

### サービス層

- **`services/`**: ビジネスロジックとAPI呼び出しを分離
- コンポーネントから直接Firebaseを呼ばず、サービス経由でアクセス

---

## データフロー

```
User Interaction
      ↓
  Component (Vue)
      ↓
  Service Layer → Firebase / External API
      ↓
  Vuex Store (状態更新)
      ↓
  Component (再レンダリング)
```

---

## PWA（Progressive Web App）

### 機能

- **オフライン対応**: Service Workerによるキャッシュ
- **インストール可能**: ホーム画面に追加
- **プッシュ通知**: Firebaseと連携

### 設定

- `vite-plugin-pwa`: PWA自動生成
- `registerServiceWorker.js`: Service Worker登録

---

## Firebase構成

### 使用サービス（推定）

- **Authentication**: ユーザー認証
- **Firestore / Realtime Database**: データベース
- **Cloud Storage**: 画像・ファイル保存
- **Hosting**: デプロイ先

---

## ビルド・デプロイ

### 開発

```bash
npm run dev       # Vite開発サーバー起動（HMR有効）
```

### ビルド

```bash
npm run build     # 本番ビルド（dist/に出力）
npm run preview   # ビルド結果をプレビュー
```

### リント・フォーマット

```bash
npm run lint      # ESLint実行 + 自動修正
npm run format    # Prettier実行
```

---

## パフォーマンス最適化

### Vite

- **高速HMR**: モジュール単位の更新
- **トリーシェイキング**: 未使用コードの削除
- **コード分割**: 動的インポート対応

### PWA

- **キャッシュ戦略**: Service Workerによる効率的なキャッシュ
- **遅延読み込み**: 必要なリソースのみ読み込み

---

## セキュリティ

### 認証

- **Firebase Authentication**: セキュアな認証フロー
- **bcryptjs**: パスワードのハッシュ化

### 環境変数

- Firebase API キー等は環境変数で管理（`.env` ファイル）

---

## 拡張性

### 新機能追加の流れ

1. `services/` にビジネスロジックを追加
2. `store/modules/` に状態管理を追加（必要に応じて）
3. `components/` または `pages/` にUIを実装
4. `router/` にルートを追加（ページの場合）
5. ESLint・Prettierでコード品質を維持

---

## 参考リンク

- [Vue 3 公式ドキュメント](https://ja.vuejs.org/)
- [Vuetify 3 公式ドキュメント](https://vuetifyjs.com/)
- [Vite 公式ドキュメント](https://ja.vitejs.dev/)
- [Firebase 公式ドキュメント](https://firebase.google.com/docs)
