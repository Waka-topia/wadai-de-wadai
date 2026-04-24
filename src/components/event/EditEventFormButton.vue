<template>
  <v-bottom-sheet v-model:model-value="formDialogOpen" max-height="90vh">
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
    <v-card rounded="t-xl" class="overflow-y-auto" style="max-height: 90vh">
      <v-card-title class="text-subtitle-1 font-weight-bold d-flex align-center">
        <v-btn icon variant="text" size="default" color="orange" @click="closeFormDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <div class="d-flex align-center justify-center flex-grow-1">
          <v-icon class="mr-2" size="small">mdi-calendar-outline</v-icon>
          新歓イベントの登録
        </div>
        <div style="width: 40px" />
      </v-card-title>

      <v-divider />
      <EventForm />
    </v-card>
  </v-bottom-sheet>
</template>

<script setup>
import { ref, watch } from 'vue'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import EventForm from '@/components/event/EventForm.vue'

const formDialogOpen = ref(false)

watch(formDialogOpen, (open) => {
  if (open) {
    void logFirebaseAnalyticsEvent('event_edit_form_open', {})
  }
})
const closeFormDialog = () => {
  formDialogOpen.value = false
}
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 100px;
  right: 16px;
  z-index: 1000;
}
</style>
