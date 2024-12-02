<template>
  <TabsBar :tabsName="tabsName" :tabsComponent="tabsComponent" />
  <BottomNavigation />
</template>

<script>
import DailyRanking from "@/components/molecules/DailyRanking.vue";
import MonthlyRanking from "@/components/molecules/MonthlyRanking.vue";
import WeeklyRanking from "@/components/molecules/WeeklyRanking.vue";
import BottomNavigation from "@/components/organisms/BottomNavigation.vue";
import TabsBar from "@/components/organisms/TabsBar.vue";

export default {
  data() {
    return {
      tabsName: ["日", "週", "月"],
      tabsComponent: [DailyRanking, WeeklyRanking, MonthlyRanking],
    };
  },
  name: "RankingPage",
  components: {
    BottomNavigation,
    TabsBar,
  },
};
</script>
