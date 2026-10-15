# Firestore のルールとインデックスのデプロイ

ルールは、デプロイした瞬間に全ユーザーに効きます。間違えると、アプリが動かなくなるか、データが誰でも書ける状態になります。必ず dev で確かめてから本番に出してください。ルールの変え方そのものは skill `firestore-rules-change` を見てください。

## 手順

1. コンパイルできるかを確かめてから、dev に出します（デプロイは人の承認を得てから）。

   ```bash
   firebase deploy --only firestore:rules --dry-run --project wadai-de-wadai-dev   # 何もデプロイしない
   firebase use dev
   firebase deploy --only firestore:rules,firestore:indexes
   ```

2. dev で、ルールに関わる画面を人に操作してもらいます（イベントの登録と編集、時間割、シラバスの編集、代表者の申請など）。

   注意：`firestore.rules` の管理者 UID は本番のアカウントのものです。そのため、dev では管理者の操作（申請の承認など）が拒否されます。これは dev での確認の限界なので、管理者の操作は本番で確かめることになります。

3. ルールの変更を含む PR が `prod` にマージされたら、本番に出します（人の承認を得てから）。

   ```bash
   git switch prod && git pull --ff-only
   firebase use prod
   firebase deploy --only firestore:rules,firestore:indexes
   ```

4. 本番で、未ログインのまま公開データ（新歓カレンダー）が表示されること、ログインして主な操作ができることを、人に確かめてもらいます。

## 戻すとき

前のコミットのルールに一時的に置き換えてデプロイし、手元のファイルは元に戻します（人の承認を得てから）。

```bash
git show <前のコミット>:firestore.rules > firestore.rules
firebase deploy --only firestore:rules
git checkout -- firestore.rules
```

戻したあとは、原因を直した PR を通常の手順で出し直してください。

インデックスは、作り直しに時間がかかることがあります。デプロイ後に Firebase Console のインデックス画面で「作成中」が終わるまで待ってください。
