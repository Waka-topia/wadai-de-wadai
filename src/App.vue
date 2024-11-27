<template>
  <div id="app">
    <router-view></router-view>
    <propColor></propColor>
  </div>
</template>

<script>
import propColor from "@/components/prop-color.vue";

export default {
  name: "App",
  components: {
    propColor,
  },
};
</script>

<!-- <style>
#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #f4f4f4;
  min-height: 100vh;
}

h1 {
  color: #333;
}

button {
  cursor: pointer;
}
</style> -->
