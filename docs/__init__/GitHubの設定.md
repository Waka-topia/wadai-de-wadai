## Gitの重要な初期設定

### デフォルトブランチをmasterではなく、mainにする

```bash
git config --global init.defaultBranch main
```

### .DS_Storeをデフォルトでignoreにする

```bash
cat > ~/.config/git/ignore <<EOF
.DS_Store
EOF
```

## リポジトリの接続

```bash
git init
git remote add origin <URL>
git add .
git commit -m "initial commit"
git push origin main
```

## テンプレートの作成

```bash
mkdir .github
mkdir .github/workflows

cat > .github/pull_request_template.md <<EOF

### 対応したissueのURL


### 対応内容（何に取り組んだか）


### 対応方法(どう対処したか具体的に)


### レビューしてほしい点（工夫点など）

***

## 最終チェックリスト(xでチェックが入ります)
- [ ] 対応するissueのリンクは貼りましたか
- [ ] 適切なタイトルをつけましたか
- [ ] レビューアをアサインしましたか
- [ ] 適切なラベルを付けましたか
- [ ] 適切にコメントしていますか
EOF

mkdir .github/ISSUE_TEMPLATE

cat > .github/ISSUE_TEMPLATE/bug_report.md <<EOF
---
name: Bug report
about: Create a report to help us improve
title: バグ報告内容
labels: bug

---

### 観察される振る舞い（現状）
  テキストまたはスクリーンショット

### 期待される振る舞い（期待）


### 再現方法


### その他（空白でも可）


***

## 最終チェックリスト
- [ ] レビューアをアサインしましたか
- [ ] 適切なタイトルが付けられていますか
- [ ] 適切なラベルをつけましたか
EOF

cat > .github/ISSUE_TEMPLATE/feature_report.md <<EOF
---
name: Feature request
about: Suggest an idea for this project
title: 追加機能などの内容
labels: enhancement

---

### 観察される振る舞い（現状）
  テキストまたはスクリーンショット


### 期待される振る舞い（やりたいこと）


### 実装方針（どうしたら実現できるかを，だいたいでいいので書いてください）


### その他（空白でも可）

***

## 最終チェックリスト
- [ ] レビューアをアサインしましたか
- [ ] 適切なタイトルが付けられていますか
- [ ] 適切なラベルをつけましたか
EOF

cat > .github/ISSUE_TEMPLATE/feature_report.yml <<EOF
name: Feature request
description: File a feature request.
title: "[FEATURE]: "
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this feature request!

  - type: textarea
    id: problem
    attributes:
      label: 関連する問題
      description: この機能リクエストに関連する問題を説明してください
      placeholder: 例）〜の操作が面倒です
    validations:
      required: true

  - type: textarea
    id: solution
    attributes:
      label: 提案する解決策
      description: 考えられる解決策を説明してください
    validations:
      required: true

  - type: textarea
    id: alternatives
    attributes:
      label: 代替案
      description: 検討した他の解決策があれば記述してください
    validations:
      required: false

  - type: textarea
    id: additional
    attributes:
      label: その他の情報
      description: スクリーンショットや参考資料などがあれば追加してください
    validations:
      required: false

EOF

cat > .github/ISSUE_TEMPLATE/bug_report.yml <<EOF
name: Bug report
description: File a bug report.
title: "[BUG]: "
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!

  - type: textarea
    id: description
    attributes:
      label: バグの説明
      description: バグの内容を詳しく説明してください
      placeholder: できるだけ具体的に記述してください
    validations:
      required: true

  - type: textarea
    id: reproduction
    attributes:
      label: 再現手順
      description: バグを再現するための手順を記述してください
      placeholder: |
        1. '...' に移動
        2. '....' をクリック
        3. '....' までスクロール
        4. エラーが発生
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: 期待する動作
      description: 本来期待される動作を記述してください
    validations:
      required: true

  - type: dropdown
    id: browsers
    attributes:
      label: 発生したブラウザ
      multiple: true
      options:
        - Chrome
        - Firefox
        - Safari
        - Edge
        - Brave
        - その他

EOF
```
