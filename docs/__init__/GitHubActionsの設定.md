```bash
mkdir .github/workflows

cat > .github/workflows/lint-and-format.yml <<EOF
name: Lint and Format

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  lint-and-format:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Prettier
        run: npm run format

      - name: Run ESLint
        run: npm run lint

      - name: Check for changes
        run: |
          if [ -n "$(git status --porcelain)" ]; then
            echo "Error: Files were modified by formatter or linter"
            git diff
            exit 1
          fi

EOF
```
