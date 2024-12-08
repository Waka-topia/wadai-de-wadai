<template>
  <div>
    <QRScanner></QRScanner>
  </div>
</template>

<script>
import QRScanner from "@/components/templates/QRScanner.vue";

export default {
  name: "ReaderComponent",
  components: {
    QRScanner,
  },
};
</script>
