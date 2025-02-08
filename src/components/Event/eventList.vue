<template>
  <div class="event-list">
    <vue-cal
      :events="events"
      :on-event-click="openEventModal"
      :disable-views="['years', 'year']"
      today-button
      locale="ja"
      class="vuecal"
      style="height: 70vh"
      :selected-date="selectedDate"
      @cell-focus="selectedDate = $event"
    ></vue-cal>

    <EventSchedule :events="events" :selected-date="selectedDate" />

    <v-dialog v-model:model-value="dialog" max-width="700">
      <template #activator="{ props: activatorProps }">
        <v-btn class="text-white font-weight-bold show-form-btn" color="orange" v-bind="activatorProps" elevation="15" rounded>
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
    <!-- @toggle-edit-delete="toggleEditDeleteForm" -->
  </div>
</template>

<script>
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import { mapGetters } from "vuex";
import { verifyOrganizerPassword, addEvent, getEvents, deleteEvent } from "@/services/eventService";
import EventForm from "@/components/Event/EventForm.vue";
import EventModal from "@/components/Event/EventModal.vue";
import EventSchedule from "@/components/Event/EventSchedule.vue";
import { or } from "firebase/firestore";

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
      organizerId: "",  // 修正されたプロパティ
      password: "",     // 修正されたプロパティ
      isEventFormVisible: false,  // フォーム表示制御用の変数
      scrollControl: false,  // スクロール制御用の変数
      selectedDate: null, // カレンダーで選択された日付
    };
  },
  computed: {
    ...mapGetters("event", ["allEvents"]),
  },
  methods: {
    async fetchEvents() {
      try {
        const events = await getEvents();
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
        }));
      } catch (error) {
        console.error("イベントの取得に失敗しました:", error);
      }
    },
    async submitEvent(newEvent, organizerId, password) {
      try {
        const isPasswordValid = await verifyOrganizerPassword(organizerId, password);
        if (!isPasswordValid) {
          alert("団体IDまたはパスワードが間違っています。");
          return;
        }
        const eventData = {
          date: newEvent.date,
          startTime: newEvent.startTime,
          endTime: newEvent.endTime,
          location: newEvent.location,
          description: newEvent.description,
          organizerName: newEvent.organizerName,
          class: newEvent.class,
        };
        await addEvent(eventData, organizerId);
        this.fetchEvents();
        alert("イベントを登録しました。");
      } catch (error) {
        console.error("イベントの登録に失敗しました:", error);
      }
    },
    openEventModal(event) {
      this.modalEvent = { ...event };
      console.log("modalEvent", this.modalEvent);
      this.isModalVisible = true;
      this.scrollControl = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalEvent = {};
      this.scrollControl = false;
    },
    toggleEventForm() {
      this.isEventFormVisible = !this.isEventFormVisible;  // フォームの表示・非表示を切り替える
    },
    // toggleEditDeleteForm() {
    //   this.isEditDeleteFormVisible = !this.isEditDeleteFormVisible;
    //   if (this.isEditDeleteFormVisible) {
    //     // フォームを開くとき、選択されたイベントの organizerId を初期値に設定
    //     this.DeleteFormOrganizerId = this.modalEvent.organizerId || "";  // 修正
    //     this.DeleteFormPassword = "";  // 修正
    //   }
    // },
    async handleDeleteEvent(organizerId, password) {
      console.log("handleDeleteEvent started");
      console.log("modalEvent", this.modalEvent);

      try {
        if (!this.modalEvent.eventId) {
          console.warn("No eventId found, returning");
          this.errorMessage = "削除対象のイベントが選択されていません。";
          return;
        }

        console.log("organizerId", organizerId);
        console.log("password", password);

        console.log("Verifying password...");
        const isPasswordValid = await verifyOrganizerPassword(organizerId, password);
        console.log("verifyOrganizerPassword result:", isPasswordValid);

        if (!isPasswordValid) {
          console.warn("Invalid password, returning");
          this.errorMessage = "団体IDまたはパスワードが間違っています。";
          return;
        }

        console.log("deleteEvent", this.modalEvent.eventId);
        await deleteEvent(this.modalEvent.eventId, organizerId, password);

        this.fetchEvents();
        this.closeModal();
      } catch (error) {
        console.error("Error in handleDeleteEvent:", error);
        this.errorMessage = error.message;
      }
    },
  },
  mounted() {
    this.fetchEvents();
  },
};
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
  transition: box-shadow .3s, left .3s, width .3s;
  overflow: hidden;
}

</style>
