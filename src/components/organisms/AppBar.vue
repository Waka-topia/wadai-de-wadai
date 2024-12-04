<template>
  <div class="bg-white">
    <v-app-bar-nav-icon class="position-fixed right-0" @click="onNavIconClick"></v-app-bar-nav-icon>
    <header class="text-center font-weight-bold">
      <h1>{{ title }}</h1>
    </header>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    drawer: {
      type: Boolean,
      default: false,
    },
  },
  name: "AppBar",
  methods: {
    onNavIconClick() {
    },
  },
};
</script>
