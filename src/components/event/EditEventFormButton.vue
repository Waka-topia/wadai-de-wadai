<template>
  <v-bottom-sheet v-model="isOpen">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        class="text-white font-weight-bold fab-btn py-7 px-5 d-flex align-center justify-center"
        color="orange"
        variant="elevated"
        elevation="4"
        rounded="pill"
      >
        団体向けフォーム
      </v-btn>
    </template>

    <v-card class="rounded-t-xl">
      <SheetHeader
        title="新歓イベントの登録"
        :loading="isSubmitting"
        @close="isOpen = false"
        @submit="onSubmit"
      />

      <div class="sheet-body">
        <EventForm ref="formRef" @success="isOpen = false" />
      </div>
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import EventForm from '@/components/event/EventForm.vue'
import SheetHeader from '@/components/templates/SheetHeader.vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const isOpen = ref(false)
const isSubmitting = ref(false)
const formRef = ref(null)

watch(isOpen, (open) => {
  if (open) {
    void logFirebaseAnalyticsEvent('event_edit_form_open', {})
  }
})

const onSubmit = async () => {
  isSubmitting.value = true

  try {
    await formRef.value?.submit()
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 100px;
  right: 16px;
  z-index: 1000;
}

.sheet-body {
  /* 通常は 70dvh。キーボードが出ているときはその上に残る空間いっぱいまで使う
     （ヘッダーぶんの 140px を差し引く） */
  max-height: min(70dvh, calc(100dvh - var(--keyboard-inset, 0px) - 140px));
  overflow-y: auto;
}
</style>
