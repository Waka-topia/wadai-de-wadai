<template>
  <!-- class / hint などの属性は v-text-field にそのまま渡る。見た目は FormFieldDefaults に従う -->
  <v-text-field
    v-model="email"
    :rules="[required, emailFormat, emailDomainCheck]"
    type="email"
    autocomplete="email"
    clearable
    label="メールアドレス"
    placeholder="sample@gmail.com"
    prepend-inner-icon="mdi-email-outline"
  />
</template>

<script setup>
import { emailDomainCheck, emailFormat, required } from '@/utils/forms/validate'

// 入力中のメールアドレス
const email = defineModel({ type: String, default: '' })
</script>
