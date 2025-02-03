<template>
  <div>
    <v-progress-linear color="success" v-if="isLoading" indeterminate=""></v-progress-linear>
    <v-btn @click="updateRanking" size="large" color="orange" elevation="20" class="show-form-btn" icon="mdi-refresh" intermediate></v-btn>
    <RankingList :key="renderKey" />
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
const renderKey = ref(0);
const isLoading = ref(false);

const updateRanking = async () => {
  try {
    isLoading.value = true;
    await rankingService.updateTop100();
    renderKey.value += 1;
    snackbar.value = {
      show: true,
      text: "ランキングを更新しました。",
      color: "success",
    };
    isLoading.value = false;
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `ランキングの更新に失敗しました。${error}`,
      color: "error",
    };
  }
};
</script>

<style>
.show-form-btn {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 20px + 56px);
  right: 20px;
  z-index: 100;
}
</style>
