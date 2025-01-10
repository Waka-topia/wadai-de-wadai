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
          <span @click="closeModal" class="close-btn">&times;</span>
          <h2>{{ modalEvent.title }}</h2>
          <p><strong>日付:</strong> {{ modalEvent.start.toLocaleDateString() }}</p>
          <p><strong>時間:</strong> {{ modalEvent.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }} ～ {{ modalEvent.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</p>
          <p><strong>場所:</strong> {{ modalEvent.location }}</p>
          <p><strong>概要:</strong> {{ modalEvent.description }}</p>
          <p><strong>団体名:</strong> {{ modalEvent.organizerName }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import VueCal from "vue-cal";
  import "vue-cal/dist/vuecal.css";
  import { mapGetters } from "vuex";
  import { verifyOrganizerPassword, addEvent, getEvents } from "@/services/eventService";
  
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
          console.log("イベントデータ1:", events);
          this.events = events.map((event) => ({
            start: new Date(`${event.date}T${event.startTime}`),
            end: new Date(`${event.date}T${event.endTime}`),
            title: event.organizerName,
            class: event.class,
            location: event.location,
            description: event.description,
            organizerName: event.organizerName,
          }));
          console.log("イベントを取得しました:", this.events);
          console.log("イベントデータ2:", events);
        } catch (error) {
          console.error("イベントの取得に失敗しました:", error);
        }
      },
      toggleFormVisibility() {
        this.isFormVisible = !this.isFormVisible;
      },
      openEventModal(event) {
        this.modalEvent = event;
        this.isModalVisible = true;
      },
      closeModal() {
        this.isModalVisible = false;
        this.modalEvent = {};
      },
    },
    mounted() {
      this.fetchEvents();
    },
  };
  </script>
  

  <style scoped>
  /* ベースレイアウト */
  .vuecal{
    height: 600px
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

  .edit-btn {
    display: block;
    margin: 1.5rem auto;
    background-color: #ff9800;
  }

  button:hover.edit-btn {
    background-color: #e68900;
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

  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    max-width: 600px;
    width: 90%;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    position: relative;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #333;
  }
</style>