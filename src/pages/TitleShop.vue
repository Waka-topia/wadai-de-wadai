<template>
    <div class="event-cal">
      <TitleList />
    </div>
  </template>
  
  <script>
  import TitleList from "@/components/ExchangeTitle.vue";
  
  export default {
    name: "event-cal",
    components: {
      TitleList,
    },
  };
  </script>
  
  <style scoped>
  v-main{
    overflow: hidden;
  }
  </style>
  