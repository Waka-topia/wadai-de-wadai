# アーキテクチャ

ワダイdeワダイは、Vue 3 で作った SPA（PWA）です。バックエンドは Firebase（Authentication、Cloud Firestore、Hosting、Analytics）だけで、独自のサーバーはありません。使っているライブラリとバージョンは [`package.json`](../package.json) を見てください。

## 層の構成

```
pages / components（画面）
  └─ store（Vuex）           状態とキャッシュ
       └─ services            Firestore・Auth へのアクセス
            └─ firebase/config.js   Firebase の初期化
```

- **Firebase の SDK を呼ぶのは `src/services/` だけ**にしています。画面や store から Firestore を直接触らないので、データの形やコレクション名を変えるときに見る場所が 1 か所で済みます。
- 画面からサービスを呼ぶ経路は 2 通りあります。一覧のように複数の画面で共有するデータは、store の action を経由して呼びます（イベント、時間割、シラバス）。管理画面のように 1 画面でしか使わない処理は、画面から直接呼んでいます（例：`src/pages/AdminPage.vue`）。
- Firestore の `db` は `@/firebase/config` から import します。`reviewService.js` と `syllabusService.js` は `getFirestore()` を直接呼んでいますが、同じインスタンスが返るので動きは変わりません。

## ディレクトリ

| ディレクトリ       | 役割                                                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`       | ルートに対応する画面                                                                                                                                          |
| `src/components/`  | 機能ごとのフォルダ（`event`、`timetable`、`home` など）。`common/` には、`BaseBottomSheet`・`BaseDialog`・各種の State 表示など、画面をまたいで使う部品を置く |
| `src/store/`       | Vuex。`index.js` でモジュールを登録する                                                                                                                       |
| `src/services/`    | Firestore・Auth・Analytics へのアクセス                                                                                                                       |
| `src/composables/` | 画面をまたいで使うロジック（`useSnackbar`、`useFormSubmit`、`useMapLibre` など）                                                                              |
| `src/config/`      | 定数とナビゲーションの定義                                                                                                                                    |
| `src/data/`        | 静的なマスタデータ（団体、キャンパスの建物、電車・バスの時刻表）                                                                                              |
| `src/utils/`       | 副作用のない関数（日付の整形、ハッシュ、入力チェックなど）                                                                                                    |
| `src/plugins/`     | Vuetify の初期化                                                                                                                                              |

## 状態管理（Vuex）

モジュールは [`src/store/index.js`](../src/store/index.js) で登録しています。名前空間の付け方がモジュールごとに違うので、`dispatch` や `getters` の名前を書く前に `index.js` を確認してください。

- `timetable`、`users`、`event` は、`index.js` の側で `namespaced: true` を付けています。user モジュールの登録名は `users` です。
- `jobs` には名前空間がありません。

主なキャッシュの方法：

- **event**：取得済みの月を `fetchedMonths` に記録し、同じ月を何度も読まないようにしています。
- **timetable**：選んでいる学年・学期・クォーターを localStorage に保存し、次に開いたときに復元します。
- **syllabus**：検索用インデックス（`lecture_search/all_lectures_index`）を丸ごと読み込み、検索はクライアントで行います。

## ルーティングとレイアウト

ルートは [`src/router/index.js`](../src/router/index.js) にあり、すべての画面を動的 import で読み込みます。ルートの `meta` で、次のことを指定します。

| meta                            | 用途                                                                        |
| ------------------------------- | --------------------------------------------------------------------------- |
| `requiresAuth`、`requiresAdmin` | アクセス制御（[認証と権限](auth-and-roles.md)）                             |
| `layout`                        | PC での本文の最大幅（`narrow`（既定）・`wide`・`full`）。スマホでは効かない |
| `background`                    | 画面の背景色。本文の外側まで塗る                                            |

スマホでは画面下のナビゲーションバー、PC（Vuetify の `md` 以上）では左のサイドナビを表示します。項目は [`src/config/navigation.js`](../src/config/navigation.js) で共通に定義しています。フォームは、スマホではボトムシート、PC では中央のダイアログで開きます（`BaseBottomSheet`）。

## 主な機能

| 機能             | 画面                         | 補足                                                                                                   |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| ホーム           | `/`                          | 電車・バスの発車までの時間（`src/data/rawTimetables.js` の静的な時刻表）、キャンパスマップ、外部リンク |
| 新歓カレンダー   | `/eventcal`、`/eventcal/:id` | イベントの登録・編集・削除、代理登録イベントの引き継ぎ                                                 |
| 時間割           | `/timetable`                 | 学年・学期・クォーターごとの時間割と単位の集計                                                         |
| シラバス検索     | `/syllabus-search`           | みんなで編集するシラバスと、授業の評価                                                                 |
| 地図             | `/map`                       | MapLibre GL と MapTiler のキャンパス地図                                                               |
| マイページ       | `/mypage`                    | プロフィール、所属団体、アプリの QR コード                                                             |
| 代表者証明・管理 | `/prove-owner`、`/admin`     | [認証と権限](auth-and-roles.md)                                                                        |

### 今は画面から使っていない機能

次の機能はコードが残っていますが、今は画面から使っていません。今後戻す予定があるので、削除せずに残しています。

- **求人**：`/jobs` は「準備中」の画面を表示しています。一覧（`RecruitPage.vue`）はルートから外しています。詳細ページ（`/jobs/:id`）のデータは `src/services/jobsService.js` に直接書かれています。
- **スタンプと QR の読み取り**：`stampService.js` と `ReaderPage.vue` があります。`ReaderPage.vue` は存在しない `components/templates/QRScanner.vue` を import しているので、このままでは動きません。動く版は `revival/2025-04` ブランチにあります。
- **地図上の施設評価**：store の `location`・`rating` と、`locationService.js`・`ratingService.js` があります。`locations` コレクションはルールに定義がないので、読み書きは拒否されます。

## PWA

[vite-plugin-pwa](https://vite-pwa-org.netlify.app/) で Service Worker と manifest を生成しています（`vite.config.js`、`registerType: 'autoUpdate'`）。

既知の課題があります。`src/registerServiceWorker.js` が、存在しない `service-worker.js` を別に登録しようとしています。また、`index.html` が存在しない `/manifest.json` を参照しています。vite-plugin-pwa が生成するのは `sw.js` と `manifest.webmanifest` です。manifest の説明文も、今の機能と合っていません。

## アクセス解析

Firebase Analytics で、ページの表示を記録しています（`src/composables/useFirebasePageView.js`、`src/services/analyticsService.js`）。

## 関連する文書

- [データモデル](data-model.md)：Firestore のコレクションと権限
- [認証と権限](auth-and-roles.md)
- [環境](environments.md)：Firebase プロジェクト、環境変数、ブランチ、CI
- [コーディング規約](coding-style.md)
