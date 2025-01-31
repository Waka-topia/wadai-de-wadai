<!-- EditDeleteForm.vue: 編集・削除フォーム -->
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
      <button @click="$emit('delete-event', organizerId, password)">削除</button>
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