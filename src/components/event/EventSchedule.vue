<template>
  <div class="event-schedule">
    <div class="nav-buttons">
      <button class="nav-btn" @click="changeDate(-1)">&#x3C;</button>
      <h3 class="title">{{ formattedSelectedDate }} の新歓イベント</h3>
      <button class="nav-btn" @click="changeDate(1)">&#x3E;</button>
    </div>

    <div v-if="filteredEvents.length === 0" class="no-events">イベントはありません</div>

    <div v-else class="d-flex flex-column ga-2">
      <div
        v-for="event in filteredEvents"
        :key="event.eventId"
        class="border-md rounded-lg"
        @click="openEventModal(event)"
      >
        <v-row class="py-4">
          <v-col
            class="text-center justify-center align-center font-weight-bold text-body-2"
            cols="3"
          >
            <div>
              {{ formatTime(event.start) }}
            </div>
            <div>〜</div>
            <div>
              {{ formatTime(event.end) }}
            </div>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col cols="9">
            <div>
              <p class="text-h6 font-weight-bold">{{ event.title }}</p>
              <p class="text-caption font-weight-bold text-grey-lighten-2 text-truncate">
                {{ event.description }}
              </p>
              <p class="text-body-2 font-weight-bold text-orange">
                <v-icon color="orange">mdi-map-marker</v-icon>{{ event.location }}
              </p>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  events: {
    type: Array,
    required: true,
  },
  selectedDate: {
    type: [String, Date],
    default: null,
  },
})

const emit = defineEmits(['openModal', 'update:selectedDate'])

const internalSelectedDate = ref(props.selectedDate ? new Date(props.selectedDate) : new Date())

const formattedSelectedDate = computed(() => {
  return internalSelectedDate.value
    .toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    .replace(/\//g, '-')
})

const filteredEvents = computed(() => {
  return props.events.filter((event) => {
    const eventDate = new Date(event.start)
      .toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
      .replace(/\//g, '-')
    return eventDate === formattedSelectedDate.value
  })
})

watch(
  () => props.selectedDate,
  (newVal) => {
    internalSelectedDate.value = new Date(newVal)
  },
)

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

const openEventModal = (event) => {
  emit('openModal', event)
}

const changeDate = (days) => {
  const newDate = new Date(internalSelectedDate.value)
  newDate.setDate(newDate.getDate() + days)
  internalSelectedDate.value = newDate
  emit('update:selectedDate', newDate.toISOString().split('T')[0])
}
</script>

<style scoped>
.event-schedule {
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 10px;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.nav-btn:hover {
  color: #ff9800;
}

.title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.no-events {
  text-align: center;
  color: #888;
  font-size: 14px;
}
</style>
