<template>
    <div class="dashboard">
      <h1>キャンパスマップ </h1>
      <p>ここではあなたの進捗状況を確認できます。</p>
      <CampusMap />
      <!-- <propColor></propColor> -->
    </div>
  </template>
  
  <script>
  // import propColor from '@/components/prop-color.vue';
  import CampusMap from '@/components/CampusMap.vue';

  export default {
    name: "Dashboard",
    components: {
      StampsList,
      // propColor,
    },
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
  