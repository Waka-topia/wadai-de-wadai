<template>
  <TabsBar></TabsBar>
  <BottomNavigation></BottomNavigation>
</template>

<script>
import BottomNavigation from "@/components/organisms/BottomNavigation.vue";
import TabsBar from "@/components/organisms/TabsBar.vue";

export default {
  name: "RankingPage",
  components: {
    BottomNavigation,
    TabsBar,
  },
};
</script>
