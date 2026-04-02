<template>
  <v-container fluid class="event-root">
    <!-- Back -->
    <v-btn icon variant="text" class="mb-2" @click="router.back()">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-alert
      v-if="fetchErrorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      icon="mdi-alert-circle"
    >
      {{ fetchErrorMessage }}
    </v-alert>

    <v-card v-else-if="event.eventId" rounded="lg" elevation="2">
      <!-- Title -->
      <v-card-title class="text-h5 font-weight-bold pa-5 pb-2">
        {{ event.title }}
      </v-card-title>

      <v-card-text class="px-5 pb-5 mb-3">
        <!-- Meta blocks -->
        <v-list-item class="px-0">
          <template #prepend>
            <v-avatar color="orange" size="40" rounded="lg">
              <v-icon color="white" size="20">mdi-account-group</v-icon>
            </v-avatar>
          </template>
          <v-list-item-subtitle class="text-caption text-uppercase"> 団体名 </v-list-item-subtitle>
          <v-list-item-title class="font-weight-bold">
            {{ event.organizerName }}
          </v-list-item-title>
        </v-list-item>

        <v-divider inset />

        <v-list lines="two" class="pa-0">
          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-calendar</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 日付 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.date }}
            </v-list-item-title>
          </v-list-item>

          <v-divider inset />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-clock</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 時間 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.startTime }} – {{ event.endTime }}
            </v-list-item-title>
          </v-list-item>

          <v-divider inset />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-map-marker</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 場所 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.location }}
            </v-list-item-title>
          </v-list-item>

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg" class="align-self-start mt-1">
                <v-icon color="white" size="20">mdi-text-long</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 概要 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold text-wrap" style="line-height: 1.6">
              {{ event.description }}
            </v-list-item-title>
          </v-list-item>

          <v-divider inset />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="blue-grey" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-account-edit</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase">
              作成者
            </v-list-item-subtitle>
            <v-list-item-title class="font-weight-medium">
              {{ event.createdByName || '匿名ユーザー' }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- Danger action -->
      <EditDeleteForm :event-id="eventId" />
    </v-card>

    <v-card v-else rounded="lg" elevation="2" class="pa-6 text-center">
      <v-progress-circular indeterminate color="orange" size="28" class="mr-2" />
      読み込み中...
    </v-card>
  </v-container>
</template>

<script setup>
import { useStore } from 'vuex'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditDeleteForm from '@/components/event/EditDeleteForm.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const fetchErrorMessage = ref('')

const eventId = computed(() => String(route.params.id || ''))

onMounted(async () => {
  try {
    await store.dispatch('event/fetchEvent', eventId.value)
  } catch (error) {
    fetchErrorMessage.value = error.message
  }
})

const event = computed(() => {
  return store.getters['event/event'] || {}
})
</script>

<style scoped>
.event-root {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 40px;
}
</style>
