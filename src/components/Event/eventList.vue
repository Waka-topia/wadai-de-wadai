<template>
  <div class="event-list">
    <!-- カレンダー表示 -->
    <vue-cal
      :events="events"
      :on-event-click="openEventModal"
      :disable-views="['years', 'year']"
      today-button
      locale="ja"
      class="vuecal"
    ></vue-cal>

    <!-- 編集・削除フォーム -->
    <div v-if="isEditDeleteFormVisible" class="edit-delete-form">
      <div class="form-group">
        <label for="organizer-id">団体ID:</label>
        <input type="text" v-model="organizerId" required />
      </div>

      <div class="form-group">
        <label for="password">パスワード:</label>
        <input type="password" v-model="password" required />
      </div>

      <!-- <button @click="handleUpdateEvent">更新</button> -->
      <button @click="handleDeleteEvent">削除</button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <!-- 編集ボタン -->
    <button @click="toggleFormVisibility" class="edit-btn">
      団体向けフォーム
    </button>

    <!-- イベント登録フォーム -->
    <form v-show="isFormVisible" @submit.prevent="submitEvent">
      <div class="form-group">
        <label for="date">日付:</label>
        <input type="date" v-model="newEvent.date" required />
      </div>

      <div class="form-group">
        <label for="start-time">開始時刻:</label>
        <input type="time" v-model="newEvent.startTime" required />
      </div>

      <div class="form-group">
        <label for="end-time">終了時刻:</label>
        <input type="time" v-model="newEvent.endTime" required />
      </div>

      <div class="form-group">
        <label for="location">場所:</label>
        <input type="text" v-model="newEvent.location" required />
      </div>

      <div class="form-group">
        <label for="description">概要:</label>
        <textarea v-model="newEvent.description" required></textarea>
      </div>

      <div class="form-group">
        <label for="organizer-name">団体名:</label>
        <input type="text" v-model="newEvent.organizerName" required />
      </div>

      <div class="form-group">
        <label for="organizer-id">団体ID:</label>
        <input type="text" v-model="organizerId" required />
      </div>

      <div class="form-group">
        <label for="password">パスワード:</label>
        <input type="password" v-model="password" required />
      </div>

      <button type="submit">イベントを登録</button>
    </form>

    <!-- エラーメッセージ -->
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

    <!-- イベント詳細モーダル -->
    <div v-if="isModalVisible" class="modal">
      <div class="modal-content">
        <v-btn @click="closeModal" class="close-btn"><v-icon>mdi-close</v-icon></v-btn>
        <h2>{{ modalEvent.title }}</h2>
        <p><strong>日付:</strong> {{ modalEvent.start.toLocaleDateString() }}</p>
        <p><strong>時間:</strong> {{ modalEvent.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }} ～ {{ modalEvent.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</p>
        <p><strong>場所:</strong> {{ modalEvent.location }}</p>
        <p><strong>概要:</strong> {{ modalEvent.description }}</p>
        <p><strong>団体名:</strong> {{ modalEvent.organizerName }}</p>

        <!-- 編集・削除ボタン -->
        <button @click="toggleEditDeleteForm" class="edit-btn">編集・削除</button>
      </div>
    </div>
  </div>
</template>

<script>
import VueCal from "vue-cal";
import "vue-cal/dist/vuecal.css";
import { mapGetters } from "vuex";
import { verifyOrganizerPassword, addEvent, getEvents, updateEvent, deleteEvent } from "@/services/eventService";

export default {
  components: {
    VueCal,
  },
  data() {
    return {
      newEvent: {
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        organizerName: "",
        class: "custom-event",
      },
      organizerId: "",
      password: "",
      errorMessage: "",
      events: [],
      isFormVisible: false,
      isModalVisible: false,
      modalEvent: {},
      isEditDeleteFormVisible: false, // 編集・削除フォームの表示管理
    };
  },
  computed: {
    ...mapGetters("event", ["allEvents"]),
  },
  methods: {
    async submitEvent() {
      try {
        const isPasswordValid = await verifyOrganizerPassword(this.organizerId, this.password);
        if (!isPasswordValid) {
          this.errorMessage = "団体IDまたはパスワードが間違っています。";
          return;
        }
        const eventData = {
          date: this.newEvent.date,
          startTime: this.newEvent.startTime,
          endTime: this.newEvent.endTime,
          location: this.newEvent.location,
          description: this.newEvent.description,
          organizerName: this.newEvent.organizerName,
          class: this.newEvent.class,
        };
        await addEvent(eventData, this.organizerId);
        this.fetchEvents();
        this.resetForm();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    resetForm() {
      this.newEvent = {
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        organizerName: "",
      };
      this.organizerId = "";
      this.password = "";
      this.errorMessage = "";
    },
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
    toggleFormVisibility() {
      this.isFormVisible = !this.isFormVisible;
    },
    openEventModal(event) {
      this.modalEvent = { ...event }; // モーダルに表示するイベント情報を設定
      this.isModalVisible = true;
    },
    closeModal() {
      this.isModalVisible = false;
      this.modalEvent = {};
    },
    toggleEditDeleteForm() {
      this.isEditDeleteFormVisible = !this.isEditDeleteFormVisible;
      if (this.isEditDeleteFormVisible) {
        // 編集・削除フォームが表示される時に、モーダルイベント情報を渡す
        console.log(this.modalEvent);
        this.organizerId = this.modalEvent.organizerId || '';
        this.eventId = this.modalEvent.eventId || '';
        this.password = '';
      }
    },
    async handleUpdateEvent() {
      try {
        const isPasswordValid = await verifyOrganizerPassword(this.organizerId, this.password);
        if (!isPasswordValid) {
          this.errorMessage = "団体IDまたはパスワードが間違っています。";
          return;
        }
        // イベント更新
        const eventData = {
          date: this.modalEvent.date,
          startTime: this.modalEvent.startTime,
          endTime: this.modalEvent.endTime,
          location: this.modalEvent.location,
          description: this.modalEvent.description,
          organizerName: this.modalEvent.organizerName,
        };
        await updateEvent(this.modalEvent.eventId, eventData, this.organizerId, this.password);
        this.fetchEvents();
        this.closeModal();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
    async handleDeleteEvent() {
      console.log(this.eventId);
      console.log(this.organizerId);
      try {
        const isPasswordValid = await verifyOrganizerPassword(this.organizerId, this.password);
        if (!isPasswordValid) {
          this.errorMessage = "団体IDまたはパスワードが間違っています。";
          return;
        }
        // イベント削除
        await deleteEvent(this.eventId, this.organizerId, this.password);
        this.fetchEvents();
        this.closeModal();
      } catch (error) {
        this.errorMessage = error.message;
      }
    },
  },
  mounted() {
    this.fetchEvents();
  },
};
</script>

  

<style scoped>
/* ベースレイアウト */
.event-list {
  height: 100%;
  overflow-y: auto;
  padding: 1rem;
}

/* カレンダー */
.vuecal {
  height: 600px;
}

/* ボタン */
button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #45a049;
}

/* フォーム */
form {
  display: grid;
  gap: 1.5rem;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background-color: #ffffff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

input, textarea {
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
}

input:focus, textarea:focus {
  border-color: #4caf50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
}

textarea {
  resize: vertical;
}

/* エラーメッセージ */
.error-message {
  color: red;
  font-size: 1rem;
  margin-top: -1rem;
}

/* モーダル */
/* モーダル全体 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* モーダルコンテンツ */
.modal-content {
  position: relative; /* 閉じるボタンを正確に配置するため */
  background-color: white;
  padding: 2rem;
  border-radius: 10px;
  width: 60%;
  max-width: 800px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* 閉じるボタン */
.close-btn {
  position: absolute;
  top: 10px; /* モーダルの端に配置 */
  right: 10px;
  font-size: 1.5rem;
  color: #333;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

/* 編集・削除フォーム */
.edit-delete-form {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.delete-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 1.1rem;
  border-radius: 8px;
}

.delete-btn:hover {
  background-color: #e53935;
}
</style>