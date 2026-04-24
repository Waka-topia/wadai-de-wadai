<template>
  <BaseBottomSheet v-model="open" title="新歓イベントの登録">
    <EventForm @success="open = false" />
  </BaseBottomSheet>
</template>

<script setup>
import { computed } from 'vue'
import BaseBottomSheet from '@/components/common/BaseBottomSheet.vue'
import EventForm from '@/components/event/EventForm.vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})
const emit = defineEmits(['update:modelValue'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>
