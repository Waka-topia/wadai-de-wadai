# データモデル（Firestore）

このアプリのデータは Cloud Firestore に置いています。画像は `src/assets` に同梱しているので、Cloud Storage と Realtime Database は使っていません。

アクセス制御の正本は [`firestore.rules`](../firestore.rules) です。この文書は、コレクションごとの役割と、主なフィールド、誰が読み書きできるかをまとめたものです。ルールを変えたら、この文書も合わせて直してください。

Firestore へのアクセスは `src/services/` に集めています。各コレクションを扱うサービスは、表の「サービス」の列を見てください。

## コレクション一覧

| コレクション                                  | 内容                                                             | 読み取り               | 書き込み                                                   | サービス                                    |
| --------------------------------------------- | ---------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `users/{uid}`                                 | プロフィール、所属団体、ブックマーク                             | 本人・管理者           | 本人・管理者                                               | `authService`、`userService`、`jobsService` |
| `users/{uid}/stampsReceived/{stampId}`        | 受け取ったスタンプ（main では未使用）                            | 本人・管理者           | 作成はログイン済みなら誰でも。更新と削除は管理者           | `stampService`                              |
| `user_timetables/{uid}/semesters/{学年-学期}` | 個人の時間割                                                     | 本人・管理者           | 本人・管理者                                               | `lectureService`                            |
| `events_monthly_hashed/{YYYY-MM}`             | 新歓イベント（月ごとに 1 ドキュメント）                          | 全員（未ログインも可） | 作成と更新はログイン済み（形と件数だけ検査）。削除は管理者 | `eventService`                              |
| `groups/{groupId}`                            | 団体のマスタと代表者                                             | 全員                   | ログイン済みなら誰でも（暫定）                             | `groupService`                              |
| `proveApplications/{id}`                      | 代表者証明の申請                                                 | 申請者本人・管理者     | 作成は本人。更新と削除は管理者                             | `proveService`                              |
| `groupRepresentatives/{groupId_uid}`          | 承認済み代表者（旧形式との互換用）                               | 本人・管理者           | 管理者                                                     | `proveService`                              |
| `lecture_syllabuses/{講義名}`                 | みんなで編集するシラバス                                         | ログイン済み           | ログイン済みなら誰でも                                     | `syllabusService`、`lectureIndexService`    |
| `lecture_search/all_lectures_index`           | シラバス検索用のインデックス（1 ドキュメント）                   | ログイン済み           | ログイン済みなら誰でも                                     | `lectureIndexService`                       |
| `lecture_reviews/{講義名}`                    | 授業の評価の平均と件数                                           | ログイン済み           | ログイン済みなら誰でも                                     | `reviewService`                             |
| `lecture_reviews/{講義名}/ratings/{uid}`      | 各ユーザーの評価                                                 | ログイン済み           | 本人                                                       | `reviewService`                             |
| `stamps/{stampId}`                            | スタンプのマスタ（main では未使用）                              | ログイン済み           | 管理者                                                     | `stampService`                              |
| `ratings/{id}`                                | 地図上の施設評価（main では未使用）                              | ログイン済み           | 作成は本人。更新と削除は管理者                             | `ratingService`                             |
| `events/{eventId}`、`lecture_index/{docId}`   | 旧コレクション。ルールだけが残っていて、コードからは使っていない | —                      | —                                                          | —                                           |

「管理者」は、`firestore.rules` の `isAdmin()` に書かれた UID のユーザーです。詳しくは [認証と権限](auth-and-roles.md) を見てください。

## コレクションごとの補足

### users

新規登録のときに `authService.signup` が作ります（`src/services/authService.js:149`）。ログイン時にドキュメントが欠けていれば補います（同 :84-96）。

| フィールド                                              | 内容                                                                     |
| ------------------------------------------------------- | ------------------------------------------------------------------------ |
| `email`、`displayName`、`photoURL`                      | プロフィール                                                             |
| `belongingOrgs`                                         | 代表者として認められた団体の ID の配列。申請が承認されたときに追加される |
| `isOfficial`、`isProvePending`、`proveOwnerApplication` | 代表者証明の状態                                                         |
| `bookmarkedJobIds`                                      | 求人のブックマーク（求人一覧は今は「準備中」で表示していない）           |

### user_timetables

学年と学期の組み合わせごとに 1 ドキュメントです（ドキュメント ID は `1-first` のような形）。1 学期分の全コマを 1 回の読み取りで取れるよう、コマごとにドキュメントを分けていません（`src/services/lectureService.js:33`）。`lectures` は「曜日-時限」をキーにしたマップです。1 コマ分を更新するときに他のコマを消さないよう、`setDoc` の `merge` で書き込みます（同 :67）。

### events_monthly_hashed

イベントを 1 件ずつのドキュメントにせず、**月ごとのドキュメントの `events` 配列**に入れています。月の一覧は 1 回の読み取りで取れますが、ルールでは配列の要素ごとに持ち主を確かめられません。

| フィールド（配列の各要素）            | 内容                                                                                |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| `eventId`                             | uuid                                                                                |
| `createdBy`                           | 作成者の uid を SHA-256 にした値（`src/utils/crypto.js`）。uid そのものは保存しない |
| `createdByName`                       | 作成者の表示名                                                                      |
| `organizationId`                      | 団体 ID（`groups` のドキュメント ID）                                               |
| `isOfficial`、`role`、`eventPriority` | 代表者が登録したイベントかどうかと、表示の優先度                                    |
| `date`、`startTime`、ほか             | 日時と内容                                                                          |

運営が代わりに登録したイベントは、`createdBy` が管理者 UID のハッシュと一致するかどうかで見分けます（`src/composables/useProxyEvent.js`）。

### groups

初期データは `src/data/groups.js` にあり、`registerAllGroupsService` で投入します（`src/services/groupService.js:19`）。

| フィールド                            | 内容                                                             |
| ------------------------------------- | ---------------------------------------------------------------- |
| `name`、`mainCategory`、`subCategory` | 団体の情報                                                       |
| `representatives`                     | 代表者の配列。各要素は `userId`、`userName`、`role`、`grantedAt` |
| `representativeCount`                 | 代表者の人数                                                     |
| `hasPassword`、`passwordHash`         | 2 人目以降の代表者が使う団体パスワード（bcrypt）                 |

### proveApplications

代表者証明の申請です。`status` は `pending` で作られ、管理者が審査すると `approved` か `rejected` になります。コードは `inReview` も審査中として扱いますが、この値を設定する処理はありません。検索に使う複合インデックスは [`firestore.indexes.json`](../firestore.indexes.json) にあります。

### lecture_search

全授業の検索用データを 1 つのドキュメントにまとめ、クライアントで丸ごと読み込んで検索しています（`src/services/lectureIndexService.js`）。シラバスを保存するときは、`lecture_syllabuses` とこのインデックスを同じトランザクションで更新します。

## 既知の課題

次の穴は、公開前から本番に残っているものです。直すまでの間、新しいコードでこれらの書き込みに頼る設計を増やさないでください。

- `groups` はログインしていれば誰でも書き込めます。そのため、パスワードなしで、任意の団体の代表者に自分を追加できます。また、`passwordHash` は誰でも読めるので、団体パスワードをオフラインで総当たりされるおそれがあります。
- `events_monthly_hashed` は、他人のイベントを書き換えられます。持ち主の確認は、クライアント側の `verifyEventOwnership`（`src/services/eventService.js:254`）だけで行っています。
- `users` は、本人が `isOfficial` や `belongingOrgs` を自分で書き換えられます。
- `proveApplications` は、申請時の団体パスワードを平文のまま保存しています（`src/services/proveService.js:49`）。
- `lecture_*` は、ログインしていれば誰でも削除できます。また、フィールドの検査もありません。
- `locations` コレクションはルールに定義がないため、`locationService` からの読み書きはすべて拒否されます（地図の施設評価は今は使っていません）。

これらは、ルールの強化と、サーバー側での照合（Cloud Functions など）で直す予定です。直したら、この一覧から消してください。
