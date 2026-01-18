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
      style="height: 70vh"
      @cell-click="selectedDate = $event"
    ></VueCal>

    <v-divider class="my-5"></v-divider>

    <v-btn class="font-weight-bold set-today-btn" rounded variant="outlined" @click="setToday">
      <v-icon left>mdi-calendar-today</v-icon>
      今日の新歓イベント
    </v-btn>

    <EventSchedule :events="events" :selected-date="selectedDate" @open-modal="openEventModal" />

    <v-dialog v-model:model-value="dialog" max-width="700">
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
        <EventForm @submit-event="submitEvent" />
        <v-divider />

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">キャンセル</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <EventModal
      v-show="isModalVisible"
      :event="modalEvent"
      @close-modal="closeModal"
      @delete-event="handleDeleteEvent"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import EventForm from './EventForm.vue'
import EventModal from './EventModal.vue'
import EventSchedule from './EventSchedule.vue'
import { addEvent, deleteEvent, getEvents, verifyOrganizerPassword } from '@/services/eventService'

// Data
const dialog = ref(false)
const events = ref([])
const isModalVisible = ref(false)
const modalEvent = ref({})
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})
const selectedDate = ref(null)
const minDate = ref(new Date('2025-04-01'))
const maxDate = ref(new Date('2025-05-31'))

// Methods
const showSnackbar = (color, message) => {
  snackbar.value = {
    show: true,
    color: color,
    message: message,
  }
}

const fetchEvents = async () => {
  try {
    const fetchedEvents = await getEvents()
    events.value = fetchedEvents.map((event) => ({
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
  } catch (error) {
    console.error('イベントの取得に失敗しました:', error)
    showSnackbar('error', `イベントの取得に失敗しました: ${error.message}`)
  }
}

const submitEvent = async (newEvent, orgId, pass) => {
  try {
    const isPasswordValid = await verifyOrganizerPassword(orgId, pass)
    if (!isPasswordValid) {
      showSnackbar('error', '団体IDまたはパスワードが間違っています。')
      return
    }
    const eventData = {
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      location: newEvent.location,
      description: newEvent.description,
      organizerName: newEvent.organizerName,
      class: newEvent.class,
    }
    await addEvent(eventData, orgId)
    fetchEvents()
    showSnackbar('success', 'イベントを登録しました。')
    dialog.value = false
  } catch (error) {
    console.error('イベントの登録に失敗しました:', error)
    showSnackbar('error', `イベントの登録に失敗しました: ${error.message}`)
  }
}

const openEventModal = (event) => {
  modalEvent.value = { ...event }
  isModalVisible.value = true
}

const closeModal = () => {
  isModalVisible.value = false
  modalEvent.value = {}
}

const handleDeleteEvent = async (orgId, pass) => {
  try {
    if (!modalEvent.value.eventId) {
      showSnackbar('error', '削除対象のイベントが選択されていません。')
      return
    }

    const isPasswordValid = await verifyOrganizerPassword(orgId, pass)

    if (!isPasswordValid) {
      showSnackbar('error', '団体IDまたはパスワードが間違っています。')
      return
    }

    await deleteEvent(modalEvent.value.eventId, orgId, pass)

    showSnackbar('success', '新歓イベントを削除しました')

    fetchEvents()
    closeModal()
  } catch (error) {
    console.error('Error in handleDeleteEvent:', error)
    showSnackbar('error', `イベントの削除に失敗しました: ${error.message}`)
  }
}

const setToday = () => {
  selectedDate.value = new Date().toISOString().split('T')[0]
}

// Lifecycle
onMounted(() => {
  fetchEvents()
})
</script>

<style>
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
