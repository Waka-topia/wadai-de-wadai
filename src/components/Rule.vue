<template>
  <div class="rules-container">
    <!-- <h1>和大DE話題 利用規約</h1>
    -->
    <div class="rule-section">
      <h2>1. 適用範囲</h2>
      <p>本利用規約は、和大DE話題（以下「本アプリ」）の利用に関するルールを定めるものです。</p>
    </div>

    <div class="rule-section">
      <h2>2. 利用目的</h2>
      <p>本アプリは、和歌山大学の新入生と公認団体が新歓活動を円滑に行うことを目的としています。</p>
    </div>

    <div class="rule-section">
      <h2>3. アカウント登録</h2>
      <p>本アプリの利用には、メールアドレスを用いたアカウント登録が必要です。</p>
      <p>ユーザーは正確な情報を入力し、第三者にアカウントを譲渡・貸与してはなりません。</p>
    </div>

    <div class="rule-section">
      <h2>4. 収集情報とプライバシー</h2>
      <p>本アプリは、メールアドレスのみを収集します。</p>
      <p>収集したメールアドレスは、いかなる目的にも使用されません。</p>
    </div>

    <div class="rule-section">
      <h2>5. アプリの機能と利用ルール</h2>
      <p>団体代表は、新歓イベントをカレンダーに登録できます。</p>
      <p>新入生は、登録されたイベントを閲覧し、QRコードを読み取ることでスタンプを獲得できます。</p>
      <p>獲得したスタンプの種類によって称号が付与され、ランキングに表示されます。</p>
      <p>
        ユーザー間の直接的なメッセージ機能はありませんが、ランキング上で他ユーザーのユーザー名・所持スタンプ数・次回参加予定の新歓情報を確認できます。
      </p>
    </div>

    <div class="rule-section">
      <h2>6. 禁止事項</h2>
      <ul>
        <li>同じ日付に複数イベントを登録すること。</li>
        <li>ハッキングや不正アクセスなど、本アプリの運営を妨害する行為。</li>
        <li>
          アプリ内の画像を、このアプリと識別できない形で使用すること（SNS等での通常の投稿は許可）。
        </li>
      </ul>
    </div>

    <div class="rule-section">
      <h2>7. 違反時の対応</h2>
      <p>ユーザーが本規約に違反した場合、運営側はアカウントを停止することができます。</p>
    </div>

    <div class="rule-section">
      <h2>8. 免責事項</h2>
      <p>本アプリの運営は、ユーザーに事前通知なく変更・中断・終了することがあります。</p>
      <p>本アプリの利用により生じた損害について、運営側は一切の責任を負いません。</p>
    </div>

    <div class="rule-section">
      <h2>9. 規約の変更</h2>
      <p>
        本利用規約は、必要に応じて改訂されることがあります。改訂後の規約は、アプリ内で通知した時点から効力を持ちます。
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulePage',
}
</script>

<style scoped>
.rules-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.rule-section {
  margin-bottom: 20px;
}

h2 {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
}

p {
  line-height: 1.6;
}

ul {
  padding-left: 20px;
  list-style-type: disc;
}

ul li {
  margin-bottom: 8px;
}
</style>
