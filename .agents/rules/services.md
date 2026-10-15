---
paths:
  - 'src/services/**'
---

# サービス層を変えるとき

- Firebase の SDK を呼ぶのはこの層だけです。画面や store からは、ここの関数を呼んでください（`docs/architecture.md`）。
- `db` と `auth` は `@/firebase/config` から import してください。`getFirestore()` を新しく呼ばないでください。
- 権限の確認（代表者かどうか、イベントの持ち主かどうか）をここで行っても、Firestore に直接リクエストを送れば回避できます。守る必要があるものは `firestore.rules` でも守ってください。
- コレクションやフィールドを増やしたり変えたりしたら、`docs/data-model.md` も直してください。
- 新しい関数は、名前付き export のアロー関数で書き、JSDoc を付けてください（このフォルダの多数派です）。
