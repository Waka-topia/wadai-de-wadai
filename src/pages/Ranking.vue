<template>
    <div>
      <h1>ランキング</h1>
      <ul v-if="!isLoading && rankings.length > 0">
        <li v-for="(user, index) in rankings" :key="user.userId">
          {{ index + 1 }}位: ユーザーID {{ user.userId }} - {{ user.count }} スタンプ
        </li>
      </ul>
      <p v-if="isLoading">ランキングを読み込んでいます...</p>
      <p v-if="error">エラーが発生しました: {{ error.message || error }}</p>
        <propColor/>
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from "vuex";
  import PropColor from "@/layouts/prop-color.vue";
  
  export default {
    name: "Ranking",
    components: {
      PropColor,
    },
    computed: {
      ...mapGetters("ranking", ["rankings", "isLoading", "error"]),
    },
    methods: {
      ...mapActions("ranking", ["fetchRankings"]),
    },
    mounted() {
      this.fetchRankings();
    },
  };
  </script>
