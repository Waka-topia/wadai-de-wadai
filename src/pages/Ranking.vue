<template>
  <div>
    <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
    <v-skeleton-loader v-if="isLoading" :elevation="1" type="list-item-avatar" />
    <v-alert v-if="error" text={{ errorMessages }} title="エラー" type="error"></v-alert>
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
