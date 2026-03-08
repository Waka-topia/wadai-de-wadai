<template>
  <div class="timetable-page">
    <header class="page-header">
      <h1>時間割</h1>
    </header>

    <main class="page-content">
      <!-- 後ほど TimetableGrid を実装 -->
      <div class="empty-state">
        <p>時間割はまだ登録されていません。</p>
      </div>
    </main>
  </div>
</template>

<script setup>
// 共通のレイアウトやガードがあればここに追加
</script>

<style scoped>
.timetable-page {
  padding: 1rem;
  padding-bottom: 80px; /* ナビゲーションの高さ分 */
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: var(--text-color, #333);
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #888;
}
</style>
