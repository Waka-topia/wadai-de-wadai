<template>
  <form class="px-2 mx-2" @submit.prevent="submitEvent">
    <div class="form-group">
      <label for="date">日付:</label>
      <input
        class="form-control"
        type="date"
        v-model="newEvent.date"
        max="2025-05-31"
        min="2025-04-01"
        required
      />
    </div>
    <div class="form-group">
      <label for="start-time">開始時刻:</label>
      <input class="form-control" type="time" v-model="newEvent.startTime" required />
    </div>
    <div class="form-group">
      <label for="end-time">終了時刻:</label>
      <input class="form-control" type="time" v-model="newEvent.endTime" required />
    </div>
    <div class="form-group">
      <label for="location">場所:</label>
      <input
        class="form-control"
        type="text"
        v-model="newEvent.location"
        placeholder="イベントの場所"
        required
      />
    </div>
    <div class="form-group">
      <label for="description">概要:</label>
      <textarea
        class="form-control"
        v-model="newEvent.description"
        placeholder="イベントの概要を入力"
        required
      ></textarea>
    </div>
    <div class="form-group">
      <label for="organizer-name">団体名(略称可):</label>
      <input
        class="form-control"
        type="text"
        v-model="newEvent.organizerName"
        placeholder="団体名（略称可）"
        required
      />
    </div>
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input class="form-control" type="text" v-model="organizerId" placeholder="団体ID" required />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input
        class="form-control"
        type="password"
        v-model="password"
        placeholder="パスワード"
        required
      />
    </div>
    <button class="submit-btn" type="submit">イベントを登録</button>
  </form>
</template>

<script>
export default {
  emits: ['submitEvent'],
  data() {
    return {
      newEvent: {
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        organizerName: '',
        class: 'custom-event',
      },
      organizerId: '',
      password: '',
    }
  },
  methods: {
    // フォームをリセットするメソッド
    resetForm() {
      this.newEvent = {
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        description: '',
        organizerName: '',
        class: 'custom-event',
      }
    },

    // イベントを送信するメソッド
    submitEvent() {
      this.$emit('submitEvent', this.newEvent, this.organizerId, this.password) // 親コンポーネントにイベントを送信
      this.resetForm() // 送信後にフォームをリセット
    },
  },
}
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

input,
textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

input:focus,
textarea:focus {
  border-color: #4caf50;
  outline: none;
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-btn {
  display: inline-block;
  padding: 12px 24px;
  background-color: #4caf50;
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
