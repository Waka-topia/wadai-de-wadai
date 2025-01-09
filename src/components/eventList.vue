<template>
    <div class="event-list">
      <h1>カレンダー</h1>
      <!-- カレンダー表示 -->
      <vue-cal :events="events" :styles="calendarStyles" :event-style="eventStyle"></vue-cal>

        <!-- 編集ボタン -->
      <button @click="toggleFormVisibility" class="edit-btn">
        追加
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

    </div>
  </template>
  
  <script>
  import VueCal from "vue-cal";
  import "vue-cal/dist/vuecal.css";
  import { mapGetters, mapActions } from "vuex";
  import { verifyOrganizerPassword, addEvent, getEvents } from "@/services/eventService";
  
  export default {
    components: {
      VueCal
    },
    data() {
      return {
        newEvent: {
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          description: '',
          organizerName: '',
        },
        organizerId: '',
        password: '',
        errorMessage: '',
        events: [],
        isFormVisible: false,  // フォームの表示状態
      };
    },
    computed: {
      ...mapGetters("event", ["allEvents"]),
    },
    methods: {
      async submitEvent() {
        try {
          // パスワード検証
          const isPasswordValid = await verifyOrganizerPassword(this.organizerId, this.password);
          if (!isPasswordValid) {
            this.errorMessage = "団体IDまたはパスワードが間違っています。";
            return;
          }
  
          // イベントデータを送信
          const eventData = {
            date: this.newEvent.date,
            startTime: this.newEvent.startTime,
            endTime: this.newEvent.endTime,
            location: this.newEvent.location,
            description: this.newEvent.description,
            organizerName: this.newEvent.organizerName,
          };
          await addEvent(eventData, this.organizerId);
  
          // イベントリストを更新
          this.fetchEvents();
  
          // フォームをリセット
          this.newEvent = {
            date: '',
            startTime: '',
            endTime: '',
            location: '',
            description: '',
            organizerName: '',
          };
          this.organizerId = '';
          this.password = '';
          this.errorMessage = ''; // エラーメッセージをリセット
        } catch (error) {
          this.errorMessage = error.message;
        }
      },
  
      async fetchEvents() {
          try {
              const events = await getEvents();
              this.events = events.map(event => ({
              start: new Date(`${event.date}T${event.startTime}`),
              end: new Date(`${event.date}T${event.endTime}`),
              title: event.organizerName,
              description: event.description,
              }));
          } catch (error) {
              console.error("イベントの取得に失敗しました:", error);
          }
      },
  
      eventStyle(event) {
        const isOverlap = this.events.filter(e => e.start === event.start && e.end === event.end).length > 1;
        return {
          backgroundColor: isOverlap ? "#ff6347" : "#4caf50",
          color: "white",
        };
      },
  
      toggleFormVisibility() {
        this.isFormVisible = !this.isFormVisible;
      }
    },
    mounted() {
      this.fetchEvents();
    }
  };
  </script>
  
  <style scoped>
  .event-list {
    max-width: 800px;
    margin: 0 auto;
  }
  
  button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .edit-btn {
    background-color: #ff9800;
  }
  
  button:hover.edit-btn {
    background-color: #e68900;
  }
  
  form {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 2rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    background-color: #fafafa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
  }
  
  input, textarea {
    padding: 0.8rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input[type="date"], input[type="time"] {
    font-size: 1.1rem;
  }
  
  button {
    background-color: #4caf50;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    cursor: pointer;
    border-radius: 4px;
    font-size: 1.1rem;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .error-message {
    color: red;
    font-size: 1rem;
  }
  
  .vuecal {
    max-width: 100%;
  }
  </style>
  