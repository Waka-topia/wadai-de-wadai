<template>
  <!-- label / rules / hint などの属性は v-text-field にそのまま渡る -->
  <v-text-field
    v-model="password"
    :append-inner-icon="isVisible ? 'mdi-eye' : 'mdi-eye-off'"
    :type="isVisible ? 'text' : 'password'"
    clearable
    prepend-inner-icon="mdi-lock-outline"
    variant="outlined"
    color="orange-darken-2"
    density="comfortable"
    @click:append-inner="isVisible = !isVisible"
  />
</template>

<script setup>
import { ref } from 'vue'

// 入力中のパスワード
const password = defineModel({ type: String, default: '' })

// パスワードを平文で表示するかどうか
const isVisible = ref(false)
</script>
