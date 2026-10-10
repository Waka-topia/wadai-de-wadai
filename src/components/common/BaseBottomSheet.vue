<template>
  <v-bottom-sheet
    v-model:model-value="open"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :scrollable="scrollable"
  >
    <template v-if="$slots.activator" #activator="{ props: activatorProps }">
      <slot :props="activatorProps" name="activator" />
    </template>
    <v-card rounded="t-xl" class="d-flex flex-column overflow-hidden">
      <div class="bottom-sheet-handle"></div>
      <template v-if="title || $slots['title-action']">
        <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center flex-shrink-0">
          <v-btn icon variant="text" size="default" color="orange" @click="open = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <div class="d-flex align-center justify-center flex-grow-1">{{ title }}</div>
          <div class="d-flex align-center" style="min-width: 40px">
            <slot name="title-action" />
          </div>
        </v-card-title>
        <v-divider />
      </template>
      <div class="overflow-y-auto flex-grow-1">
        <slot :close="() => (open = false)" :is-open="open" />
      </div>
      <template v-if="$slots.actions">
        <v-divider />
        <v-card-actions class="pa-3 flex-shrink-0">
          <slot name="actions" :close="() => (open = false)" />
        </v-card-actions>
      </template>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: undefined },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '90vh' },
  maxWidth: { type: String, default: undefined },
  scrollable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

// v-model が渡されない場合（activator のみ）は内部 ref で管理する
const internalOpen = ref(false)

const open = computed({
  get: () => (props.modelValue !== undefined ? props.modelValue : internalOpen.value),
  set: (val) => {
    if (props.modelValue !== undefined) emit('update:modelValue', val)
    else internalOpen.value = val
  },
})
</script>

<style scoped>
.bottom-sheet-handle {
  width: 36px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 8px auto 0;
  flex-shrink: 0;
}
</style>
