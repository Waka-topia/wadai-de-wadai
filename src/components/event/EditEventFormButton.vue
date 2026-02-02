<template>
  <v-dialog v-model:model-value="formDialogOpen" max-width="700">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        class="text-white font-weight-bold fab-btn"
        color="orange"
        variant="elevated"
        elevation="4"
        rounded
        prepend-icon="mdi-calendar-plus"
      >
        団体向けフォーム
      </v-btn>
    </template>
    <v-card rounded="lg">
      <v-card-title class="text-h5 font-weight-bold pa-5 pb-3">
        <v-icon class="mr-2" color="orange">mdi-calendar-clock-outline</v-icon>
        新歓イベントの登録
      </v-card-title>

      <v-divider />
      <EventForm />
      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="closeFormDialog">キャンセル</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from 'vue'
import EventForm from '@/components/event/EventForm.vue'

const formDialogOpen = ref(false)
const closeFormDialog = () => {
  formDialogOpen.value = false
}
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 1000;
}
</style>
