<template>
  <div>
    <AppBar :title="title" :drawer="drawer" />
    <QRScanner></QRScanner>
    <BottomNavigation></BottomNavigation>
  </div>
</template>

<script>
import AppBar from "@/components/organisms/AppBar.vue";
import BottomNavigation from "@/components/organisms/BottomNavigation.vue";
import QRScanner from "@/components/templates/QRScanner.vue";

export default {
  data() {
    return {
      drawer: false,
      title: "スキャン",
    };
  },
  name: "ReaderComponent",
  components: {
      BottomNavigation,
      QRScanner,
      AppBar,
  },
};
</script>
