<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  export default {
    name: "App",
  };
</script>

<style>
#app {
  font-family: 'Arial', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #fff3e0;
  min-height: 100vh;
}

/* デフォルトで定義されているCSSをオーバーライド */
@media (min-width: 1024px) {
  #app {
    display: block;
  }
  body {
    display: block;
    place-items: unset;
  }
}

body, main {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  background-color: #fff3e0; /* 背景色を調整 */
}

</style>
