<template>
  <div>
    <button @click="updateRanking" class="update-ranking-button"><v-icon>mdi-reload</v-icon></button>
    <RankingList />
  </div>
</template>

<script>
import RankingList from "@/components/UserRanking/RankingList.vue";
import rankingService from '@/services/rankingService';

export default {
  name: "RankingPage",
  components: {
    RankingList,
  },
  methods: {
    async updateRanking() {
      try {
        // ランキング更新メソッドを呼び出し
        await rankingService.updateTop100();
      } catch (error) {
        console.error("ランキング更新エラー:", error);
        alert("ランキングの更新に失敗しました。");
      }
    }
  },
};
</script>

<style scoped>
.update-ranking-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.update-ranking-button:hover {
  background-color: #45a049;
}
</style>
