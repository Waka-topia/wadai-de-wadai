<template>
    <div>
      <h1>イベントカレンダー</h1>
      <vue-cal
        v-model="calendarDate"
        @dayclick="viewEventDetails"
        :events="events"
        :disabled-days="disabledDays"
      />
  
      <!-- 新規イベント登録フォーム -->
      <div v-if="isCreatingNewEvent">
        <h2>新しいイベントを登録</h2>
        <form @submit.prevent="createEvent">
          <label for="name">イベント名</label>
          <input v-model="newEvent.name" type="text" id="name" required />
  
          <label for="startTime">開始時間</label>
          <input v-model="newEvent.startTime" type="time" id="startTime" required />
  
          <label for="endTime">終了時間</label>
          <input v-model="newEvent.endTime" type="time" id="endTime" required />
  
          <label for="location">場所</label>
          <input v-model="newEvent.location" type="text" id="location" required />
  
          <label for="description">概要</label>
          <textarea v-model="newEvent.description" id="description" required></textarea>
  
          <!-- パスワード入力フィールド -->
          <label for="password">パスワード</label>
          <input v-model="password" type="password" id="password" required />
  
          <button type="submit">イベントを登録</button>
        </form>
      </div>
  
      <!-- 登録成功メッセージ -->
      <div v-if="eventCreatedSuccessfully">
        <p>イベントが正常に登録されました！</p>
        <p><strong>イベント名:</strong> {{ newEvent.name }}</p>
        <p><strong>開始時間:</strong> {{ newEvent.startTime }} - {{ newEvent.endTime }}</p>
        <p><strong>場所:</strong> {{ newEvent.location }}</p>
        <p><strong>概要:</strong> {{ newEvent.description }}</p>
        <button @click="resetForm">他のイベントを登録</button>
      </div>
  
      <!-- 新規イベント作成ボタン -->
      <button @click="startNewEvent">新しいイベントを登録</button>
    </div>
  </template>
  
  <script>
  import { mapActions, mapGetters } from "vuex";
  import VueCal from "vue-cal";
  import "vue-cal/dist/vuecal.css"; // CSSをインポート
  
  export default {
    components: {
      VueCal,
    },
    data() {
      return {
        calendarDate: new Date(), // カレンダーの日付
        isCreatingNewEvent: false, // 新規イベント作成状態
        eventCreatedSuccessfully: false, // イベント登録成功状態
        newEvent: { // 新規イベント用のデータ
          name: "",
          startTime: "",
          endTime: "",
          location: "",
          description: "",
        },
        password: "", // パスワード入力
      };
    },
    computed: {
      ...mapGetters("event", ["events"]),
    },
    methods: {
      ...mapActions("event", ["addEvent"]),
  
      // 新規イベント登録のためにフォームを表示
      startNewEvent() {
        this.isCreatingNewEvent = true;
        this.eventCreatedSuccessfully = false; // 新規登録時に成功メッセージを非表示にする
      },
  
      // 新規イベント登録処理
      async createEvent() {
        // パスワードの確認
        if (this.password !== "yourSecurePassword") {
          alert("パスワードが正しくありません。");
          return;
        }
  
        try {
          // 新規イベントデータを送信
          await this.addEvent(this.newEvent);
  
          // 登録成功後にフォームをリセット
          this.eventCreatedSuccessfully = true;
          this.isCreatingNewEvent = false;
          this.newEvent = { name: "", startTime: "", endTime: "", location: "", description: "" };
          this.password = ""; // パスワードをリセット
        } catch (error) {
          console.error("イベント登録エラー", error);
          alert("イベントの登録に失敗しました。再度試してください。");
        }
      },
  
      // フォームリセット
      resetForm() {
        this.newEvent = { name: "", startTime: "", endTime: "", location: "", description: "" };
        this.isCreatingNewEvent = false;
        this.password = ""; // パスワードをリセット
      },
  
      viewEventDetails(date) {
        // 日付クリック時にイベント詳細を表示
        console.log("日付を選択:", date);
      },
    },
  };
  </script>
  
  <style scoped>
  /* 必要なスタイルをここに追加 */
  button {
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  input, textarea {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
  }
  
  form {
    max-width: 600px;
    margin: auto;
  }
  
  form label {
    font-weight: bold;
  }
  
  form input, form textarea {
    margin-top: 5px;
  }
  </style>
  