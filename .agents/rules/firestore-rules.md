---
paths:
  - 'firestore.rules'
  - 'firestore.indexes.json'
---

# Firestore ルールを変えるとき

このリポジトリは公開されているので、`firestore.rules` の穴は誰でも読めます。データを守っているのはこのファイルだけで、画面側の判定は回避できます。

- 変更の手順は skill `firestore-rules-change`（`.agents/skills/firestore-rules-change/SKILL.md`）に従ってください。
- `allow write: if isAuthenticated()` のように、「ログインしていれば誰でも書ける」ルールを新しく増やさないでください。持ち主の確認（`request.auth.uid`）と、書けるフィールドの限定（`affectedKeys().hasOnly([...])`）を入れてください。
- ルールを変えたら、`docs/data-model.md` のコレクション一覧と「既知の課題」も同じ PR で直してください。
- 管理者の UID は、ここと環境変数 `VITE_ADMIN_UID` の 2 か所にあります（`docs/auth-and-roles.md`）。
