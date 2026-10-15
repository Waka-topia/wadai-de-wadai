---
paths:
  - 'src/**/*.vue'
---

# Vue コンポーネントを変えるとき

- `<script setup>` で書いてください。
- Firestore には直接触らず、store の action か `src/services/` の関数を呼んでください。
- 作る前に、既存の部品で済まないか確かめてください。フォーム送信は `useFormSubmit`、通知は `useSnackbar`、シートやダイアログは `BaseBottomSheet` と `BaseDialog`、状態表示は `LoadingState`・`EmptyState`・`ErrorState` です（一覧は `docs/coding-style.md`）。
- PC での幅、背景色、アクセス制御は、ルートの `meta`（`layout`、`background`、`requiresAuth`、`requiresAdmin`）で指定してください（`docs/architecture.md`）。
