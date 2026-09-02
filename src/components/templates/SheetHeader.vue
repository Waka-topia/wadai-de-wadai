<template>
  <div>
    <div class="sheet-handle mx-auto my-2" />

    <div class="d-flex align-center px-2 pb-2">
      <v-btn
        icon="mdi-close"
        variant="text"
        :disabled="loading"
        aria-label="閉じる"
        @click="emit('close')"
      />

      <div class="flex-grow-1 px-2 text-center text-body-1 font-weight-bold text-truncate">
        {{ title }}
      </div>

      <v-btn
        icon="mdi-check"
        variant="text"
        color="orange"
        :loading="loading"
        aria-label="保存する"
        @click="emit('submit')"
      />
    </div>

    <v-divider />
  </div>
</template>

<script setup>
defineProps({
  /** シートのタイトル */
  title: {
    type: String,
    required: true,
  },
  /** 保存処理中かどうか */
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'submit'])
</script>

<style scoped>
.sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
