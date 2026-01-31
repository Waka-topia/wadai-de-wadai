<template>
  <div class="edit-delete-form">
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input v-model="organizerId" type="text" required />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input v-model="password" type="password" required />
    </div>
    <button class="delete-button" @click="onDelete">削除</button>
  </div>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const snackbar = ref({
  show: false,
  message: '',
  color: '',
})

const store = useStore()
const organizerId = ref('')
const password = ref('')
const props = defineProps({
  eventId: {
    type: String,
    required: true,
  },
})

const onDelete = async () => {
  try {
    await store.dispatch('event/deleteEvent', {
      eventId: props.eventId,
      organizerId: organizerId.value,
      inputPassword: password.value,
    })
    snackbar.value = {
      show: true,
      message: 'イベントが正常に削除されました。',
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      message: error.message,
      color: 'error',
    }
  }
}
</script>

<style scoped>
.edit-delete-form {
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

.delete-button {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.delete-button:hover {
  background-color: #c9302c;
}
</style>
