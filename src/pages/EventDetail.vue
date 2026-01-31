<template>
  <v-container fluid class="event-root">
    <!-- Back -->
    <v-btn icon variant="text" @click="router.back()">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <!-- Title -->
    <h1 class="event-title">
      {{ event.title }}
    </h1>

    <!-- Meta blocks -->
    <section class="event-meta">
      <div class="meta-item">
        <div class="meta-icon primary">
          <v-icon>mdi-calendar</v-icon>
        </div>
        <div class="meta-content">
          <span class="meta-label">日付</span>
          <span class="meta-value">{{ event.date }}</span>
        </div>
      </div>

      <div class="meta-item">
        <div class="meta-icon primary">
          <v-icon>mdi-clock</v-icon>
        </div>
        <div class="meta-content">
          <span class="meta-label">時間</span>
          <span class="meta-value"> {{ event.startTime }} – {{ event.endTime }} </span>
        </div>
      </div>

      <div class="meta-item">
        <div class="meta-icon primary">
          <v-icon>mdi-map-marker</v-icon>
        </div>
        <div class="meta-content">
          <span class="meta-label">場所</span>
          <span class="meta-value">{{ event.location }}</span>
        </div>
      </div>

      <div class="meta-item">
        <div class="meta-icon primary">
          <v-icon>mdi-text-long</v-icon>
        </div>
        <div class="meta-content">
          <span class="meta-label">概要</span>
          <p class="meta-value multiline">
            {{ event.description }}
          </p>
        </div>
      </div>

      <div class="meta-item">
        <div class="meta-icon primary">
          <v-icon>mdi-account-group</v-icon>
        </div>
        <div class="meta-content">
          <span class="meta-label">主催</span>
          <span class="meta-value">{{ event.organizerName }}</span>
        </div>
      </div>
    </section>

    <!-- Danger action -->
    <section class="event-actions">
      <v-btn variant="tonal" color="error" block @click="toggleEditDeleteForm">
        <v-icon start>mdi-delete</v-icon>
        削除フォーム
      </v-btn>

      <v-expand-transition>
        <div v-if="isEditDeleteFormVisible" class="mt-4">
          <EditDeleteForm :eventId="eventId" />
        </div>
      </v-expand-transition>
    </section>
  </v-container>
</template>

<script setup>
import { useStore } from 'vuex'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditDeleteForm from '@/components/event/EditDeleteForm.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()

const isEditDeleteFormVisible = ref(false)

const eventId = computed(() => String(route.params.id || ''))

// If store has no events yet (direct navigation), fetch them
if (
  !Array.isArray(store.getters['event/allEvents']) ||
  store.getters['event/allEvents'].length === 0
) {
  store.dispatch('event/fetchEvents')
}

const event = computed(() => {
  const allEvents = store.getters['event/allEvents']
  return allEvents.find((evt) => String(evt.eventId) === eventId.value)
})

const toggleEditDeleteForm = () => {
  isEditDeleteFormVisible.value = !isEditDeleteFormVisible.value
}
</script>

<style scoped>
.event-root {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 40px;
}

/* Title */
.event-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 12px 0 32px;
  line-height: 1.3;
}

/* Meta layout */
.event-meta {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Item */
.meta-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* Icon pill */
.meta-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(25, 118, 210, 0.1);
  flex-shrink: 0;
}

.meta-icon .v-icon {
  font-size: 20px;
}

/* Text */
.meta-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #757575;
}

.meta-value {
  font-size: 1rem;
  font-weight: 500;
  color: #212121;
}

.meta-value.multiline {
  line-height: 1.6;
}

/* Actions */
.event-actions {
  margin-top: 48px;
}
</style>
