<template>
    <div class="dashboard">
      <h1>ダッシュボード</h1>
      <p>ここではあなたの進捗状況を確認できます。</p>
      <div class="stats">
        <div class="stat-item">
          <h2>スタンプ数</h2>
          <p>0</p>
        </div>
        <div class="stat-item">
          <h2>称号数</h2>
          <p>0</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "Dashboard",
  };
  </script>
  
  <style scoped>
  .dashboard {
    padding: 1rem;
    text-align: center;
  }
  
  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 2rem;
  }
  
  .stat-item {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 8px;
    width: 150px;
    text-align: center;
  }
  
  .stat-item h2 {
    margin-bottom: 0.5rem;
  }
  </style>
  