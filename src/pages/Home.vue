<template>
  <div class="mx-3 my-3 text-center">
    <h1>Home Page</h1>
    <p>ようこそ！このアプリで新歓スタンプラリーを楽しんでください。</p>

    <!-- ユーザー名がVuexに保存されている場合に表示 -->
    <p v-if="isAuthenticated">こんにちは、{{ displayName }} さん！</p>
    <p v-else>ログインしていないようです。ログインしてください。</p>
  </div>
</template>

<script setup>
</script>
