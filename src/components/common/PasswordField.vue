<template>
  <!-- label / rules / hint などの属性は v-text-field にそのまま渡る。見た目は FormFieldDefaults に従う -->
  <v-text-field
    v-model="password"
    :append-inner-icon="isVisible ? 'mdi-eye' : 'mdi-eye-off'"
    :type="isVisible ? 'text' : 'password'"
    clearable
    prepend-inner-icon="mdi-lock-outline"
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
