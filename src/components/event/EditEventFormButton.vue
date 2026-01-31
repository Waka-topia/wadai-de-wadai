<template>
  <v-dialog v-model:model-value="formDialogOpen" max-width="700">
    <template #activator="{ props: activatorProps }">
      <v-btn
        v-bind="activatorProps"
        class="text-white font-weight-bold show-form-btn"
        color="orange"
        elevation="15"
        rounded
      >
        団体向けフォーム
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold">
        <v-icon class="mr-2" color="primary">mdi-calendar-clock-outline</v-icon>
        新歓イベントの登録
      </v-card-title>

      <v-divider />
      <EventForm />
      <v-divider />

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeFormDialog">キャンセル</v-btn>
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
