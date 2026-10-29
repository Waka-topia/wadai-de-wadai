# 認証と権限

ログインには Firebase Authentication（メールアドレスとパスワード）を使っています。ユーザーには、一般ユーザー・団体代表者・管理者（運営）の 3 種類があります。

画面の出し分けはクライアントで行っていますが、**データを守っているのは [`firestore.rules`](../firestore.rules) だけ**です。クライアントの判定は、Firestore に直接リクエストを送れば回避できます。権限に関わる変更をするときは、ルールの側で守れているかを必ず確かめてください。コレクションごとの権限は [データモデル](data-model.md) にまとめています。

## 起動とログイン状態

`src/main.js` は `onAuthStateChanged` の最初の通知を待ってからアプリをマウントします。そのため、ルーターのガードが動くときには、ログイン状態がすでに store に入っています。

ルートの `meta` で、アクセスできる人を制御しています（`src/router/index.js`）。

| meta            | 動き                                                   |
| --------------- | ------------------------------------------------------ |
| `requiresAuth`  | 未ログインなら `/login?redirect=...` に送る            |
| `requiresAdmin` | ログイン中のユーザーが管理者 UID でなければ `/` に送る |

## 一般ユーザー

新規登録すると、`users/{uid}` が作られます。ログインしたユーザーができることは、時間割の作成、シラバスの編集、授業の評価、イベントの登録です。

イベントの登録は、代表者でなくてもできます。代表者でない人が登録したイベントは `role: 'general'` になります。代表者が登録したイベントは `role: 'official'` になり、一覧で優先して表示されます（`src/services/eventService.js:23`、`src/store/modules/event.js`）。

## 団体代表者

代表者は団体ごとに認められ、`groups/{groupId}.representatives` に入ります。代表者になる流れは、その団体に代表者がすでにいるかどうかで変わります（`src/store/modules/prove.js`）。

### 1 人目：申請して管理者が承認する

1. 代表者証明のページ（`/prove-owner`）で、団体を選び、団体パスワードを決めて申請します。`proveApplications` に `status: 'pending'` の申請が作られます（`src/services/proveService.js:28`）。
2. 管理者が `/admin` で承認します（`updateProveOwnerApprovalService`、同 :152）。承認されると、次の処理が行われます。
   - 申請を `approved` にし、旧形式の `groupRepresentatives` にも書き込む
   - `groups` の `representatives` に追加する。その団体にまだパスワードがなければ、申請時のパスワードを bcrypt でハッシュにして `passwordHash` に保存する（`src/services/groupService.js:172`）
   - `users/{uid}.belongingOrgs` に団体 ID を追加する

### 2 人目以降：団体パスワードで登録する

すでに代表者がいる団体では、団体パスワードを入力すると、その場で代表者に登録されます。パスワードの照合はクライアントの bcrypt で行います（`addRepresentativeByPassword`、`src/services/groupService.js:107`）。

### 代理登録イベントの引き継ぎ

運営が団体の代わりに登録したイベントは、その団体の代表者が自分のものとして引き継げます（`transferEventOwnershipService`、`src/services/eventService.js:44`、画面は `src/components/event/ClaimEventDialog.vue`）。引き継げるのは、作成者が管理者で、イベントの団体と代表者の団体が一致する場合だけです。

## 管理者（運営）

管理者は 1 人の UID で決まっていて、その UID は次の 2 か所にあります。管理者を変えるときは、両方を揃えてください。

- `firestore.rules` の `isAdmin()`：データを守る側の判定
- 環境変数 `VITE_ADMIN_UID`（`src/config/constants.js`）：管理画面の表示と、代理登録イベントの判定に使う

UID は秘密情報ではありません。`VITE_ADMIN_UID` はビルドした JS に含まれ、`firestore.rules` もリポジトリで公開されています。

## 既知の課題

代表者になれるかどうかの判定（団体パスワードの照合を含む）は、クライアントでしか行っていません。そのため、Firestore に直接書き込めば、パスワードなしで代表者になれます。この穴を含む権限の課題は、[データモデルの「既知の課題」](data-model.md#既知の課題)にまとめています。
