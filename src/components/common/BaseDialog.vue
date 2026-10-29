<template>
  <v-dialog v-model="open" :max-width="maxWidth">
    <template v-if="$slots.activator" #activator="{ props: activatorProps }">
      <slot :props="activatorProps" name="activator" />
    </template>
    <v-card rounded="lg">
      <v-card-title v-if="title" class="pa-5 pb-2 font-weight-bold">{{ title }}</v-card-title>
      <slot>
        <v-card-text v-if="message" class="px-5 pb-4">{{ message }}</v-card-text>
      </slot>
      <v-card-actions v-if="confirmLabel" class="pa-4 pt-0">
        <v-btn class="flex-grow-1" variant="text" :disabled="loading" @click="open = false">
          {{ cancelLabel }}
        </v-btn>
        <v-divider vertical style="border-color: #000000; opacity: 1" />
        <v-btn
          class="flex-grow-1 font-weight-bold"
          :color="confirmColor"
          :loading="loading"
          variant="text"
          @click="emit('confirm')"
        >
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: '' },
  cancelLabel: { type: String, default: 'キャンセル' },
  confirmColor: { type: String, default: 'red' },
  maxWidth: { type: String, default: '360' },
  // 確認ボタンをローディング表示にし、キャンセルを無効化する
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>
