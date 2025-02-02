<template>
  <div>
    <v-btn @click="updateRanking" size="x-large" color="success"><v-icon>mdi-reload</v-icon></v-btn>
    <RankingList />
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
    </v-snackbar>
  </div>
</template>

<script setup>
import RankingList from "@/components/UserRanking/RankingList.vue";
import rankingService from '@/services/rankingService';
import { ref } from "vue";

const snackbar = ref({
  show: false,
  text: "",
  color: "",
  timeout: 3000,
});

const updateRanking = async () => {
  try {
    await rankingService.updateTop100();
    snackbar.value = {
      show: true,
      text: "ランキングを更新しました。",
      color: "success",
    };
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `ランキングの更新に失敗しました。${error}`,
      color: "error",
    };
  }
};
</script>
