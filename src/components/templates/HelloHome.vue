<template>
  <p class="text-emphasis font-weight-bold">こんにちは、{{ displayName }} さん！</p>
  <p class="text-center text-emphasis pb-6">
    \ <span class="font-weight-bold">和大DE話題</span>でみんなと新歓に行こう /
  </p>
  <p class="text-center text-medium-emphasis pb-6">
    自分のプロフィールを作成し、<br />新歓に行くことでスタンプが貯められます
  </p>
  <v-img
    src="https://www.wakayama-u.ac.jp/_files/00488693/mark01.gif"
    :width="211"
    aspect-ratio="1/1"
    cover
  ></v-img>
</template>

<script setup>
defineProps({
  displayName: {
    type: String,
    required: true,
  },
})
</script>
