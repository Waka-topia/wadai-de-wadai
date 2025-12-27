<template>
  <div v-if="isAuthenticated" class="d-flex flex-column justify-center align-center my-10">
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
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'

const store = useStore()
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const displayName = computed(() => store.getters['auth/user'].displayName)

// ESLint rule: vue/multi-word-component-names
defineOptions({
  name: 'HomePage',
})
</script>
