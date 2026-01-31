<template>
  <div class="event-list">
    <VueCal
      class="vuecal"
      :disable-views="['years', 'year', 'week', 'day']"
      :events="events"
      :max-date="maxDate"
      :min-date="minDate"
      :selected-date="selectedDate"
      active-view="month"
      hide-view-selector
      locale="ja"
      style="height: 60vh"
      @cell-click="onCellClick"
    ></VueCal>

    <v-divider class="my-5"></v-divider>

    <v-btn class="font-weight-bold set-today-btn" rounded variant="outlined" @click="setToday">
      <v-icon left>mdi-calendar-today</v-icon>
      今日の新歓イベント
    </v-btn>

    <div class="nav-buttons">
      <button class="nav-btn" @click="changeDate(-1)">&#x3C;</button>
      <h3 class="title">{{ selectedDate }} の新歓イベント</h3>
      <button class="nav-btn" @click="changeDate(1)">&#x3E;</button>
    </div>
    <EventSchedule v-model:selected-date="selectedDate" />

    <EditEventFormButton />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import EventSchedule from '@/components/event/EventSchedule.vue'
import EditEventFormButton from '@/components/event/EditEventFormButton.vue'

const store = useStore()

const events = computed(() => {
  const storeEvents = store.getters['event/allEvents']
  return storeEvents.map((event) => ({
    start: new Date(`${event.date}T${event.startTime}`),
    end: new Date(`${event.date}T${event.endTime}`),
    title: event.organizerName,
    class: event.class,
    location: event.location,
    description: event.description,
    organizerName: event.organizerName,
    eventId: event.eventId,
    organizerId: event.organizerId,
  }))
})

const toDateString = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = ref(toDateString(new Date()))

const minDate = ref(new Date('2025-04-01'))
const maxDate = ref(new Date('2026-05-31'))

const onCellClick = (date) => {
  selectedDate.value = toDateString(date)
}

const setToday = () => {
  selectedDate.value = toDateString(new Date())
}

const changeDate = (days) => {
  const currentDate = new Date(selectedDate.value)
  currentDate.setDate(currentDate.getDate() + days)
  selectedDate.value = toDateString(currentDate)
}

onMounted(() => {
  store.dispatch('event/fetchEvents')
})
</script>

<style>
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
.event-list {
  height: 100%;
}
.show-form-btn {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom) + 20px + 56px);
  right: 20px;
  z-index: 100;
}

.show-form-btn:hover {
  background-color: #45a049;
}

.show-form-btn:active {
  background-color: #388e3c;
}

.vuecal__event {
  border: 1px solid #388e3c;
  color: #666;
  background-color: #f8f8f8cc;
  position: relative;
  box-sizing: border-box;
  left: 0;
  width: 100%;
  z-index: 1;
  transition:
    box-shadow 0.3s,
    left 0.3s,
    width 0.3s;
  overflow: hidden;
}
</style>
