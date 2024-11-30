<template>
  <TabsBar></TabsBar>
  <propColor></propColor>
</template>

<script>
import propColor from "@/components/prop-color.vue";
import TabsBar from "@/components/TabsBar.vue";

export default {
  name: "RankingPage",
  components: {
    propColor,
    TabsBar,
  },
};
</script>
