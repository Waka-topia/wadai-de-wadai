# デプロイがうまくいかないとき

`.env*` の中身を表示して原因を探さないでください。値はキーそのものだからです。下の手順で、中身を見ずに切り分けてください。

## ビルドはできたが、画面で Firebase に接続できない（`auth/invalid-api-key` など）

環境変数が空のままビルドされています。1Password の `.env.*` は named pipe で、1Password が起動してロックが解除されていないと中身を返しません。

```bash
test -p .env.production && echo "named pipe です"   # 中身は読まない
```

人に 1Password のロックを解除してもらってから、もう一度ビルドしてください。`npm run build:prod` を経由せずに `vite build` を直接実行すると、`.env.*` は読まれません（Vite は named pipe を読み飛ばすため）。

## `firebase deploy` が別のプロジェクトに出ようとしている

`npm run deploy:*` は最初に `firebase use` で切り替えます。直接 `firebase deploy` を実行したときは、`firebase use` で今のプロジェクトを確かめてください。名前と環境の対応は `.firebaserc` にあります。

## `firebase` コマンドが認証エラーになる

人に `! firebase login --reauth` を実行してもらってください。エージェントが代わりにログインすることはできません。

## デプロイしたのに古い画面が出る

PWA の Service Worker が古い版をキャッシュしています（`registerType: 'autoUpdate'`）。再読み込みを 2 回すると新しい版に切り替わります。`scripts/verify-deploy.sh` が成功していれば、配信されているのは新しい版です。

## CI は通ったのに、手元のビルドが失敗する

CI は `.env` なしでビルドしているので、環境変数に関わるエラーは CI では出ません。手元の Node のバージョンが `mise.toml` と一致しているかも確かめてください（`node -v`）。
