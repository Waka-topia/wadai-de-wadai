<template>
  <div class="event-list">
    <vue-cal
      class="vuecal"
      :disable-views="['years', 'year', 'week', 'day']"
      :events="events"
      :max-date="maxDate"
      :min-date="minDate"
      :selected-date="selectedDate"
      @cell-click="selectedDate = $event"
      active-view="month"
      hide-view-selector
      locale="ja"
      style="height: 70vh"
    ></vue-cal>

    <v-divider class="my-5"></v-divider>

    <v-btn class="font-weight-bold set-today-btn" @click="setToday" rounded variant="outlined">
      <v-icon left>mdi-calendar-today</v-icon>
      今日の新歓イベント
    </v-btn>

    <EventSchedule :events="events" :selected-date="selectedDate" @open-modal="openEventModal" />

    <v-dialog v-model:model-value="dialog" max-width="700">
      <template #activator="{ props: activatorProps }">
        <v-btn
          class="text-white font-weight-bold show-form-btn"
          v-bind="activatorProps"
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
          <v-btn @click="dialog = false" text>キャンセル</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <EventModal
      v-show="isModalVisible"
      :event="modalEvent"
      @close-modal="closeModal"
      @delete-event="handleDeleteEvent"
    />

    <!-- フィードバック用のスナックバー -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import VueCal from 'vue-cal'
import 'vue-cal/dist/vuecal.css'
import { mapGetters } from 'vuex'
import EventForm from '@/components/Event/EventForm.vue'
import EventModal from '@/components/Event/EventModal.vue'
import EventSchedule from '@/components/Event/EventSchedule.vue'
import { addEvent, deleteEvent, getEvents, verifyOrganizerPassword } from '@/services/eventService'

export default {
  components: {
    VueCal,
    EventForm,
    EventModal,
    EventSchedule,
  },
  data() {
    return {
      dialog: false,
      events: [],
      isModalVisible: false,
      modalEvent: {},
      isEditDeleteFormVisible: false,
      organizerId: '', // 修正されたプロパティ
      password: '', // 修正されたプロパティ
      isEventFormVisible: false, // フォーム表示制御用の変数
      selectedDate: null, // カレンダーで選択された日付
      minDate: new Date('2025-04-01'), // 2025年4月1日
      maxDate: new Date('2025-05-31'), // 2025年5月31日
      // スナックバー関連の状態を追加
      snackbar: {
        show: false,
        color: '',
        message: '',
      },
      errorMessage: '', // エラーメッセージ保存用
    }
  },
  computed: {
    ...mapGetters('event', ['allEvents']),
  },
  mounted() {
    this.fetchEvents()
  },
  methods: {
    async fetchEvents() {
      try {
        const events = await getEvents()
        this.events = events.map((event) => ({
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
        this.showSnackbar('error', `イベントの取得に失敗しました: ${error.message}`)
      }
    },
    async submitEvent(newEvent, organizerId, password) {
      try {
        const isPasswordValid = await verifyOrganizerPassword(organizerId, password)
        if (!isPasswordValid) {
          this.showSnackbar('error', '団体IDまたはパスワードが間違っています。')
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
        await addEvent(eventData, organizerId)
        this.fetchEvents()
        this.showSnackbar('success', 'イベントを登録しました。')
        this.dialog = false // 登録後にダイアログを閉じる
      } catch (error) {
        console.error('イベントの登録に失敗しました:', error)
        this.showSnackbar('error', `イベントの登録に失敗しました: ${error.message}`)
      }
    },
    openEventModal(event) {
      this.modalEvent = { ...event }
      console.log('modalEvent', this.modalEvent)
      this.isModalVisible = true
      this.scrollControl = true
    },
    closeModal() {
      this.isModalVisible = false
      this.modalEvent = {}
      this.scrollControl = false
    },
    toggleEventForm() {
      this.isEventFormVisible = !this.isEventFormVisible // フォームの表示・非表示を切り替える
    },
    async handleDeleteEvent(organizerId, password) {
      console.log('handleDeleteEvent started')
      console.log('modalEvent', this.modalEvent)

      try {
        if (!this.modalEvent.eventId) {
          console.warn('No eventId found, returning')
          this.showSnackbar('error', '削除対象のイベントが選択されていません。')
          return
        }

        console.log('organizerId', organizerId)
        console.log('password', password)

        console.log('Verifying password...')
        const isPasswordValid = await verifyOrganizerPassword(organizerId, password)
        console.log('verifyOrganizerPassword result:', isPasswordValid)

        if (!isPasswordValid) {
          console.warn('Invalid password, returning')
          this.showSnackbar('error', '団体IDまたはパスワードが間違っています。')
          return
        }

        console.log('deleteEvent', this.modalEvent.eventId)
        await deleteEvent(this.modalEvent.eventId, organizerId, password)

        // 削除成功時にスナックバーで成功メッセージを表示
        this.showSnackbar('success', '新歓イベントを削除しました')

        this.fetchEvents()
        this.closeModal()
      } catch (error) {
        console.error('Error in handleDeleteEvent:', error)
        this.showSnackbar('error', `イベントの削除に失敗しました: ${error.message}`)
      }
    },
    setToday() {
      this.selectedDate = new Date().toISOString().split('T')[0] // 今日の日付を設定
    },
    // スナックバー表示用のヘルパーメソッドを追加
    showSnackbar(color, message) {
      this.snackbar = {
        show: true,
        color: color,
        message: message,
      }
    },
  },
}
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
