<template>
  <div v-show="isEditDeleteFormVisible" class="edit-delete-form">
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input type="text" v-model="organizerId" required />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input type="password" v-model="password" required />
    </div>
    <button @click="$emit('delete-event', organizerId, password)" class="delete-button">削除</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  props: {
    isEditDeleteFormVisible: Boolean,
  },
  data() {
    return {
      organizerId: "",
      password: "",
      errorMessage: "",
    };
  },
};
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
  border: 1px solid #ccc; /* 枠線を常に表示 */
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

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 8px;
}
</style>
