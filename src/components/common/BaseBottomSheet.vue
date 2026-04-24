<template>
  <v-bottom-sheet
    v-model:model-value="open"
    :max-height="maxHeight"
    :max-width="maxWidth"
    :scrollable="scrollable"
  >
    <v-card
      ref="cardRef"
      rounded="t-xl"
      class="overflow-y-auto"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
    >
      <div class="bottom-sheet-handle" />
      <template v-if="title || $slots['title-action']">
        <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
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
      <slot />
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  title: { type: String, default: '' },
  maxHeight: { type: String, default: '90vh' },
  maxWidth: { type: String, default: undefined },
  scrollable: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const open = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const cardRef = ref(null)
const touchStartY = ref(0)

// 次回オープン時に transform をリセットする（クローズ時にリセットすると一瞬元の位置が見えるため）
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      nextTick(() => {
        const el = cardEl()
        if (el) {
          el.style.transition = ''
          el.style.transform = ''
        }
      })
    }
  },
)

const cardEl = () => cardRef.value?.$el

const onTouchStart = (e) => {
  touchStartY.value = e.touches[0].clientY
  const el = cardEl()
  if (el) el.style.transition = 'none'
}

const onTouchMove = (e) => {
  const deltaY = e.touches[0].clientY - touchStartY.value
  if (deltaY <= 0) return
  const el = cardEl()
  if (el) el.style.transform = `translateY(${deltaY}px)`
}

const onTouchEnd = (e) => {
  const deltaY = e.changedTouches[0].clientY - touchStartY.value
  const el = cardEl()
  if (!el) return

  if (deltaY > 80) {
    el.style.transition = 'transform 0.3s ease'
    el.style.transform = 'translateY(100%)'
    setTimeout(() => {
      open.value = false
    }, 300)
  } else {
    el.style.transition = 'transform 0.3s ease'
    el.style.transform = ''
  }
}
</script>

<style>
.bottom-sheet-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: #ddd;
  margin: 8px auto 4px;
}
</style>
