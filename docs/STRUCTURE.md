# プロジェクト構造 (Project Structure)

このドキュメントでは `wadai-de-wadai`（2025年4月版 復刻ブランチ）のディレクトリ構成と、各ディレクトリの役割について説明します。

## ディレクトリ構成図

```text
src/
├── assets/          # 静的アセット (リボン画像、ユーザーアイコン、チュートリアル画像など)
├── components/      # Vueコンポーネント
│   ├── event/       # 新歓イベント（カレンダー・登録フォーム・編集削除）
│   ├── my-page/     # マイページ（スタンプコレクション、プロフィール、アプリQR）
│   ├── qr-reader/   # QRコード読み取りとスタンプ獲得演出
│   ├── templates/   # 共通レイアウト（BottomNavigation、ログアウト、利用規約など）
│   ├── user-profile/# プロフィールの各項目
│   └── user-ranking/# ランキング（表彰台・リスト行）
├── composables/     # ロジックの再利用単位（useStampCollection / useTopRanking など）
├── config/          # 定数（管理者UID、イベント優先度）
├── data/            # 静的マスターデータ (groups.js / stamps.js)
├── pages/           # ルーティングに対応するページコンポーネント
├── router/          # Vue Routerの設定 (ルーティング定義)
├── store/           # Vuexストア (auth / users / event / scroll)
├── services/        # Firestoreアクセスとビジネスロジック
├── plugins/         # Vuetifyなどのプラグイン設定
├── firebase/        # Firebase初期化・設定関連
├── utils/           # 汎用ユーティリティ（ハッシュ、フォーム検証、QRペイロード解析）
├── App.vue          # ルートコンポーネント
└── main.js          # エントリーポイント

public/
└── stamps/          # スタンプ画像 112枚（WebP）。Viteのバンドル対象外で /stamps/xxx.webp で参照する
```

## 主要ディレクトリの詳細

### `src/pages/`

画面単位のコンポーネントを配置します。`src/router/index.js` でURLと紐付けられます。

- `EventCal.vue`: 新歓日程（トップページ `/`）。
- `EventDetail.vue`: 新歓イベントの詳細。
- `ReaderPage.vue`: QRコード読み取り。
- `RankingPage.vue`: スタンプ数ランキング。
- `MyPage.vue`: マイページ（スタンプコレクションを含む）。
- `LoginPage.vue` / `SignupPage.vue` ほか: 認証まわり。

### `src/data/`

- `groups.js`: 団体マスター（114件）。イベント登録の団体セレクタに使用。
- `stamps.js`: スタンプマスター（112件）。`stampId` と団体名・カテゴリ・画像URLの対応を持ちます。
  不変データなので Firestore ではなくリポジトリ内に置き、Firestore は「誰がどれを取得したか」だけを保持します。

### `src/services/`

Firestore へのアクセスはすべてここに集約します。コンポーネントから直接 Firestore を呼びません。

- `stampService.js`: スタンプの付与（`grantStamp`）と取得済み一覧の読み込み。
- `rankingService.js`: `rankingEntries` のリアルタイム購読と自分のエントリ取得。
- `eventService.js` / `authService.js` / `userService.js` / `groupService.js` / `analyticsService.js`

### `src/composables/`

- `useStampCollection.js`: 取得済みスタンプとマスターを突き合わせ、全112件を進捗つきで返す。
- `useTopRanking.js`: ランキング上位の購読とアンマウント時の解除。
- `useSnackbar.js`: グローバルなスナックバー通知。
- `useFirebasePageView.js`: ページ閲覧のアナリティクス送信。

### `src/store/`

アプリケーション全体の状態管理を行います（認証情報、イベント、スクロール位置）。
スタンプとランキングは Vuex を経由せず、サービス層とコンポーザブルで完結させています。
