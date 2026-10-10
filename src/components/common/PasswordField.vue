<template>
  <!-- label / rules / hint などの属性は v-text-field にそのまま渡る。見た目は FormFieldDefaults に従う -->
  <v-text-field
    ref="field"
    v-model="password"
    :rules="confirmRules"
    :append-inner-icon="isVisible ? 'mdi-eye' : 'mdi-eye-off'"
    :type="isVisible ? 'text' : 'password'"
    clearable
    prepend-inner-icon="mdi-lock-outline"
    @click:append-inner="isVisible = !isVisible"
  />
</template>

<script setup>
import { computed, ref, useTemplateRef, watch } from 'vue'
import { confirmPasswordRule, required } from '@/utils/forms/validate'

const props = defineProps({
  // 確認欄として使うとき、一致を確かめる元のパスワード
  confirmOf: { type: String, default: undefined },
})

// 入力中のパスワード
const password = defineModel({ type: String, default: '' })

// パスワードを平文で表示するかどうか
const isVisible = ref(false)

const field = useTemplateRef('field')

// 確認欄のときだけ「必須・一致」のルールを持つ（親から rules を渡した場合はそちらが優先される）
const confirmRules = computed(() =>
  props.confirmOf === undefined ? [] : [required, confirmPasswordRule(props.confirmOf)],
)

// Vuetify はルールが変わっても再検証しないため、元のパスワードが変わったら確認欄を検証し直す
watch(
  () => props.confirmOf,
  () => {
    if (password.value) field.value?.validate()
  },
)
</script>
