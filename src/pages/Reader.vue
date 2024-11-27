<template>
    <QRScanner></QRScanner>
    <propColor></propColor>
</template>

<script>
import propColor from "@/components/prop-color.vue";
import QRScanner from "@/components/QRScanner.vue";

export default {
    name: "Reader",
    components: {
        propColor,
        QRScanner,
    },
};
</script>