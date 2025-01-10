<template>
    <div class="event-cal">
      <eventList />
    </div>
  </template>
  
  <script>
  import eventList from "@/components/Event/eventList.vue";
  
  export default {
    name: "event-cal",
    components: {
      eventList,
    },
  };
  </script>
  
  <style scoped>
  v-main{
    overflow: hidden;
  }
  </style>
  