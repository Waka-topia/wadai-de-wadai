# ルールのよく使う書き方

公式の説明は https://firebase.google.com/docs/firestore/security/rules-conditions にあります。ここでは、このリポジトリで必要になりやすいものだけをまとめます。

## 書けるフィールドを限定する

作成のときは、ドキュメントのフィールドが許可リストに収まっているかを見ます。

```
allow create: if isOwner(uid)
  && request.resource.data.keys().hasOnly(['email', 'displayName', 'photoURL']);
```

更新のときは、変わったフィールドだけを見ます。本人に `isOfficial` や `belongingOrgs` を書かせないときに使います。

```
allow update: if isOwner(uid)
  && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['displayName', 'photoURL', 'bookmarkedJobIds']);
```

## 型と長さを検査する

```
function isValidSyllabus() {
  let d = request.resource.data;
  return d.description is string && d.description.size() <= 5000
    && (!('teacher' in d) || (d.teacher is string && d.teacher.size() <= 100));
}
```

数値の範囲（評価の 1〜5 など）も同じように書けます：`d.rating is int && d.rating >= 1 && d.rating <= 5`。

## 持ち主を確かめる

ドキュメントに uid をそのまま持つ場合：

```
allow update, delete: if resource.data.userId == request.auth.uid;
allow create: if request.resource.data.userId == request.auth.uid;
```

`events_monthly_hashed` の `createdBy` は、uid そのものではなく SHA-256 の 16 進文字列です（`src/utils/crypto.js`）。ルールでは `hashing.sha256` で同じ値を作って比べられます。

```
function hashedUid() {
  return hashing.sha256(request.auth.uid).toHexString().lower();
}
```

`toHexString()` が大文字と小文字のどちらを返すかは確認できていません。`src/utils/crypto.js` は小文字を返すので、`.lower()` を付けておけば、どちらでも一致します。使う前に Emulator で確かめてください。

ただし、`events_monthly_hashed` はイベントを配列に入れているので、配列のどの要素が変わったかをルールで特定するのは困難です。根本的には、1 イベント 1 ドキュメントにする必要があります。

## ほかのドキュメントを参照する

```
allow create: if exists(/databases/$(database)/documents/stamps/$(stampId));
allow write: if request.auth.uid in get(/databases/$(database)/documents/groups/$(groupId)).data.representatives;
```

`get` と `exists` は、1 回の評価につき呼べる回数に上限があり、読み取りとして課金されます。配列の要素がオブジェクトの場合（`groups` の `representatives` は `{userId, ...}` の配列）、`in` では uid を直接探せません。uid だけの配列（`representativeIds` など）を別に持つ必要があります。

## 管理者だけに許す

```
allow update, delete: if isAdmin();
```

`isAdmin()` の UID は環境変数 `VITE_ADMIN_UID` と揃える必要があります（`docs/auth-and-roles.md`）。
