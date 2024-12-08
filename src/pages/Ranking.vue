<template>
  <div>
    <p v-if="isLoading">ランキングを読み込んでいます...</p>
    <p v-if="error">エラーが発生しました: {{ error.message || error }}</p>
    <div>
      <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
    </div>
    <ul v-if="!isLoading && rankings.length > 0">
      <li v-for="(user, index) in rankings" :key="user.userId">
        {{ index + 1 }}位: {{ user.displayName }} - {{ user.count }} スタンプ
      </li>
    </ul>
  </div>
</template>

<script>
import DailyRanking from "@/components/molecules/DailyRanking.vue";
import MonthlyRanking from "@/components/molecules/MonthlyRanking.vue";
import WeeklyRanking from "@/components/molecules/WeeklyRanking.vue";
import TabsBar from "@/components/organisms/TabsBar.vue";
import { mapActions, mapGetters } from "vuex";

export default {
  data() {
    return {
      drawer: false,
      title: "ランキング",
      tabsName: ["日", "週", "月"],
      tabsComponent: [DailyRanking, WeeklyRanking, MonthlyRanking],
    }
  },
  name: "RankingPage",
  components: {
    TabsBar,
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
