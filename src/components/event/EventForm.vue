<template>
  <form class="px-2 mx-2" @submit.prevent="submitEvent">
    <div class="form-group">
      <label for="date">日付:</label>
      <input
        v-model="newEvent.date"
        class="form-control"
        type="date"
        max="2025-05-31"
        min="2025-04-01"
        required
      />
    </div>
    <div class="form-group">
      <label for="start-time">開始時刻:</label>
      <input v-model="newEvent.startTime" class="form-control" type="time" required />
    </div>
    <div class="form-group">
      <label for="end-time">終了時刻:</label>
      <input v-model="newEvent.endTime" class="form-control" type="time" required />
    </div>
    <div class="form-group">
      <label for="location">場所:</label>
      <input
        v-model="newEvent.location"
        class="form-control"
        type="text"
        placeholder="イベントの場所"
        required
      />
    </div>
    <div class="form-group">
      <label for="description">概要:</label>
      <textarea
        v-model="newEvent.description"
        class="form-control"
        placeholder="イベントの概要を入力"
        required
      ></textarea>
    </div>
    <div class="form-group">
      <label for="organizer-name">団体名(略称可):</label>
      <input
        v-model="newEvent.organizerName"
        class="form-control"
        type="text"
        placeholder="団体名（略称可）"
        required
      />
    </div>
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input v-model="organizerId" class="form-control" type="text" placeholder="団体ID" required />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input
        v-model="password"
        class="form-control"
        type="password"
        placeholder="パスワード"
        required
      />
    </div>
    <button class="submit-btn" type="submit">イベントを登録</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['submitEvent'])

const newEvent = ref({
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  organizerName: '',
  class: 'custom-event',
})
const organizerId = ref('')
const password = ref('')

// フォームをリセットするメソッド
const resetForm = () => {
  newEvent.value = {
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    organizerName: '',
    class: 'custom-event',
  }
}

// イベントを送信するメソッド
const submitEvent = () => {
  emit('submitEvent', newEvent.value, organizerId.value, password.value) // 親コンポーネントにイベントを送信
  resetForm() // 送信後にフォームをリセット
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
