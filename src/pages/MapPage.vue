<template>
    <div class="campus-map">
      <p class="map-description">大学の開放状態を確認できます。</p>
      <CampusMap />
      <propColor/>
      <div class="stats">
        <div class="stat-item">
          <h2>エリア開放</h2>
          <p>5 / 10</p>
        </div>
        <div class="stat-item">
          <h2>クエスト完了</h2>
          <p>3 / 5</p>
        </div>
      </div>
    </div>
  </template>

  <script>
//   import CampusMap from "@/components/CampusMap.vue";
  import CampusMap from "@/components/MapBox.vue";

  export default {
    components: {
      CampusMap,
    },
    name: "MapPage",
  };
  </script>

  <style scoped>
  .campus-map {
    width: auto;
    height: auto;
    padding: 2rem;
    text-align: center;
    background-color: #f9fafb; /* 柔らかい背景色 */
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 軽いシャドウ */
  }

  .map-description {
    font-size: 1.2rem;
    color: #7f8c8d; /* 補足テキスト用の色 */
    margin-bottom: 2rem;
  }

  .stats {
    display: flex;
    justify-content: center;
    gap: 1rem; /* 要素間のスペース */
    margin-top: 2rem;
  }

  .stat-item {
    background-color: #ffffff; /* カードの背景色 */
    border: 1px solid #e0e0e0; /* カードのボーダー色 */
    padding: 1.5rem;
    border-radius: 8px;
    width: 180px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 軽いシャドウ */
    transition: transform 0.2s, box-shadow 0.2s; /* ホバーアニメーション */
  }

  .stat-item:hover {
    transform: translateY(-5px); /* ホバーで少し上に */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15); /* シャドウを強調 */
  }

  .stat-item h2 {
    font-size: 1.5rem;
    color: #2c3e50; /* タイトル色 */
    margin-bottom: 0.5rem;
  }

  .stat-item p {
    font-size: 1.2rem;
    color: #3498db; /* アクセントカラー */
    font-weight: bold;
  }
  </style>
