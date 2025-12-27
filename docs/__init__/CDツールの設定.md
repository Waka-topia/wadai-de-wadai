## Linter

### インストール

```bash
npm init @eslint/config@latest
```

## Formatter

### インストール

```bash
npm install --save-dev --save-exact prettier
```

## Git Hooks

### インストール

```bash
npm install --save-dev husky
```

### 初期化

```bash
npx husky init
```

### フックコマンドの設定

```bash
cat > .husky/pre-commit <<EOF
npm run format && npm run lint
EOF
```
