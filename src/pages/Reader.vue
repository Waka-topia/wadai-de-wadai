<template>
  <div>
    <QRScanner></QRScanner>
  </div>
</template>

<script>
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
      QRScanner,
  },
};
</script>
