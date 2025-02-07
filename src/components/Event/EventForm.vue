<template>
  <form @submit.prevent="submitEvent" class="px-2 mx-2">
    <div class="form-group">
      <label for="date">日付:</label>
      <input type="date" v-model="newEvent.date" required class="form-control" />
    </div>
    <div class="form-group">
      <label for="start-time">開始時刻:</label>
      <input type="time" v-model="newEvent.startTime" required class="form-control" />
    </div>
    <div class="form-group">
      <label for="end-time">終了時刻:</label>
      <input type="time" v-model="newEvent.endTime" required class="form-control" />
    </div>
    <div class="form-group">
      <label for="location">場所:</label>
      <input type="text" v-model="newEvent.location" required class="form-control" placeholder="イベントの場所" />
    </div>
    <div class="form-group">
      <label for="description">概要:</label>
      <textarea v-model="newEvent.description" required class="form-control" placeholder="イベントの概要を入力"></textarea>
    </div>
    <div class="form-group">
      <label for="organizer-name">団体名(略称可):</label>
      <input type="text" v-model="newEvent.organizerName" required class="form-control" placeholder="団体名（略称可）" />
    </div>
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input type="text" v-model="organizerId" required class="form-control" placeholder="団体ID" />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input type="password" v-model="password" required class="form-control" placeholder="パスワード" />
    </div>
    <button type="submit" class="submit-btn">イベントを登録</button>
  </form>
</template>

<script>
export default {
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
    };
  },
  methods: {
    // フォームをリセットするメソッド
    resetForm() {
      this.newEvent = {
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        description: "",
        organizerName: "",
        class: "custom-event",
      };
    },

    // イベントを送信するメソッド
    submitEvent() {
      this.$emit("submit-event", this.newEvent, this.organizerId, this.password);  // 親コンポーネントにイベントを送信
      this.resetForm(); // 送信後にフォームをリセット
    },
  },
};
</script>

<style scoped>
.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

input, textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  border-color: #4CAF50;
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 100%;
}

.submit-btn:hover {
  background-color: #45a049;
}

.submit-btn:active {
  background-color: #388e3c;
}
</style>
