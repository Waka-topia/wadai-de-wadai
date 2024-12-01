<template>
    <QRScanner></QRScanner>
    <BottomNavigation></BottomNavigation>
</template>

<script>
import BottomNavigation from "@/components/organisms/BottomNavigation.vue";
import QRScanner from "@/components/templates/QRScanner.vue";

export default {
    name: "ReaderComponent",
    components: {
        BottomNavigation,
        QRScanner,
    },
};
</script>
