# アーキテクチャ

> このドキュメントは **2025年4月版 復刻ブランチ（`revival/2025-04`）** の構成を説明します。
> `main` とは機能セットも Firebase プロジェクトも異なります。

## 技術スタック

### フロントエンド

- **Vue 3.5** - プログレッシブフレームワーク（Composition API / `<script setup>`）
- **Vuetify 3.11** - マテリアルデザインUIフレームワーク
- **Vue Router 4.6** - 公式ルーター
- **Vuex 4.1** - 状態管理

### ビルド/開発ツール

- **Vite 7** - 高速ビルドツール
- **Vite PWA Plugin** - Progressive Web App対応
- **Node.js 24.11.1** - `mise.toml` / `.node-version` で固定

### バックエンド/インフラ

- **Firebase 12** - 認証・Firestore・ホスティング・Analytics
- **Service Worker** - オフライン対応

### UI/UX

- **vue-qrcode-reader** - QRコード読み取り（`QrcodeStream`）
- **vue-cal** - 新歓カレンダー
- **Font Awesome & MDI** - アイコンライブラリ

### ユーティリティ

- **uuid** - 一意識別子生成

---

## ディレクトリ構造

```
wadai-de-wadai/
├── src/
│   ├── components/       # 再利用可能なUIコンポーネント
│   │   ├── event/        # 新歓イベント関連
│   │   ├── my-page/      # マイページ関連（プロフィール編集・スタンプコレクション）
│   │   ├── qr-reader/    # QR読み取りとスタンプ獲得演出
│   │   ├── templates/    # 共通レイアウト（ボトムナビ等）
│   │   ├── user-profile/ # プロフィール表示
│   │   └── user-ranking/ # ランキング（順位カード）
│   ├── composables/      # ロジックの再利用単位
│   ├── config/           # 定数
│   ├── data/             # 静的マスターデータ（groups.js / stamps.js / userIcons.js）
│   ├── pages/            # ページコンポーネント（ルートに対応）
│   ├── router/           # Vue Router設定
│   ├── store/            # Vuex Store
│   │   └── modules/      # auth / user / event / scroll
│   ├── services/         # Firestoreアクセス・ビジネスロジック
│   ├── firebase/         # Firebase設定・初期化
│   ├── plugins/          # Vueプラグイン（Vuetify等）
│   ├── utils/            # 汎用ユーティリティ
│   ├── assets/           # 静的リソース
│   │   ├── rankings/     # ランキングのリボン画像（1〜3位＋4位以降）
│   │   ├── userIcon/     # ユーザーアイコン
│   │   └── tutorial/     # PWAインストール手順の画像
│   ├── App.vue           # ルートコンポーネント
│   ├── main.js           # エントリーポイント
│   └── registerServiceWorker.js
├── public/
│   └── stamps/           # スタンプ画像112枚（WebP）
├── dist/                 # ビルド出力先
├── docs/                 # ドキュメント
├── eslint.config.js      # ESLint設定（Flat Config形式）
├── .prettierrc.json      # Prettier設定
├── vite.config.js        # Vite設定
└── package.json          # 依存関係・スクリプト
```

---

## アーキテクチャパターン

### レイヤ構成

```
User Interaction
      ↓
  Page / Component (Vue)
      ↓
  Composable（ローディング・エラー・派生状態）
      ↓
  Service Layer → Firebase / External API
      ↓
  Vuex Store（認証・イベントなど、画面をまたぐ状態のみ）
```

- **`services/`**: Firestore アクセスとビジネスロジックを集約。コンポーネントから直接 Firestore を呼びません。
- **`composables/`**: ページローカルな非同期状態（読み込み中・エラー・派生値）を扱います。
- **`store/`**: 認証やイベントのように画面をまたいで共有する状態のみ。
  スタンプとランキングは Vuex を使わず、サービス層とコンポーザブルで完結させています。

### ルーティング（Vue Router）

- 全ルートを動的インポートでコード分割
- `/` は新歓日程（`EventCal.vue`）
- 未定義パスは `/` にリダイレクト（削除済み機能のURLへの互換対応）
- `beforeEach` はスクロール位置の保存のみ

---

## データモデル（Firestore）

| パス                                   | 用途                                                                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `users/{uid}`                          | プロフィール（本人のみ読み書き可）。`displayName` / `iconId` / `nextShinkan`                                                                   |
| `users/{uid}/stampsReceived/{stampId}` | 取得済みスタンプ。`create` のみ許可し、二重取得をルールで拒否する                                                                              |
| `rankingEntries/{uid}`                 | ランキング表示用の公開プロジェクション（個人情報を含まない）。`userId` / `displayName` / `iconId` / `nextShinkan` / `stampCount` / `updatedAt` |
| `groups/{groupId}`                     | 団体マスター（読み取り専用）                                                                                                                   |
| `events_monthly_hashed/{monthKey}`     | 新歓イベント（月単位で集約）                                                                                                                   |

### スタンプとランキングの設計方針

- **スタンプのマスターは Firestore に置かない。** 不変データなので `src/data/stamps.js` に静的定義し、
  Firestore は「誰がどの `stampId` を持つか」だけを保持します。
  一覧表示に必要な Firestore 問い合わせは **1回**です。
- **ユーザーアイコンも同様に静的定義。** `src/data/userIcons.js` に8種類を持ち、
  Firestore には `iconId`（例: `userIcon3`）だけを保存します。
  パスを文字列で保存するとビルド後のハッシュ付きファイル名と一致しなくなるためです。
- **プロフィールの更新はランキングにも同時反映する。** `saveProfile` が `users/{uid}` と
  `rankingEntries/{uid}` を `writeBatch` でまとめて更新します。`rankingEntries` が未作成でも
  `stampCount: increment(0)` により 0 で作られるため、スタンプ数を読み直す必要がありません。
- **ランキングは取得時に増分更新する。** `grantStamp` が `stampsReceived` の作成と
  `rankingEntries.stampCount` の `increment(1)` を `writeBatch` で原子的に行い、
  表示側は `orderBy('stampCount','desc').limit(100)` を `onSnapshot` で購読します。
  集計バッチも更新ボタンも不要で、スタンプを取った瞬間に順位が動きます。

---

## PWA（Progressive Web App）

- **オフライン対応**: Service Workerによるキャッシュ（`vite-plugin-pwa`）
- **インストール可能**: ホーム画面に追加
- **スタンプ画像の扱い**: 112枚あるため `workbox.globIgnores` でプリキャッシュから除外し、
  `runtimeCaching`（CacheFirst / `stamp-images`）で表示したものだけを保存します。

---

## ビルド・デプロイ

```bash
npm run dev                   # 開発サーバー起動（HMR有効）
npm run build:revival         # 復刻版ビルド（.env.revival を読む）
npm run preview               # ビルド結果をローカルでプレビュー
npm run preview:revival       # 期間限定のプレビューURLへデプロイ
npm run deploy:revival:rules  # Firestoreルール・インデックスをデプロイ
npm run deploy:revival        # Firebase Hosting へデプロイ
npm run lint                  # ESLint実行 + 自動修正
npm run format                # Prettier実行
```

---

## セキュリティ

### 認証

- **Firebase Authentication**（メール/パスワード）

### アクセス制御

- `firestore.rules` で以下を担保しています。
  - `users` は本人のみ読み書き可（email を含むため他者に開放しない）
  - ランキングに必要な公開情報は `rankingEntries` に分離
  - `stampsReceived` は `create` のみ許可・`update` は禁止
  - `rankingEntries.stampCount` は自分のドキュメントに対して +1 ずつのみ許可（プロフィール更新時は変更不可）

### 環境変数

- Firebase の設定値は `.env.revival` で管理（`vite build --mode revival` が読み込む）

---

## 参考リンク

- [Vue 3 公式ドキュメント](https://ja.vuejs.org/)
- [Vuetify 3 公式ドキュメント](https://vuetifyjs.com/)
- [Vite 公式ドキュメント](https://ja.vitejs.dev/)
- [Firebase 公式ドキュメント](https://firebase.google.com/docs)
