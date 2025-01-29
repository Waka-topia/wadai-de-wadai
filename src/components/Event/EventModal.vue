<!-- EventModal.vue: イベント詳細モーダル -->
<template>
  <div v-if="isModalVisible" class="modal">
    <div class="modal-content">
      <v-btn @click="$emit('close-modal')" class="close-btn"><v-icon>mdi-close</v-icon></v-btn>
      <h2>{{ event.title }}</h2>
      <p><strong>日付:</strong> {{ event.start.toLocaleDateString() }}</p>
      <p><strong>時間:</strong> {{ event.start.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }} ～ {{ event.end.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) }}</p>
      <p><strong>場所:</strong> {{ event.location }}</p>
      <p><strong>概要:</strong> {{ event.description }}</p>
      <p><strong>団体名:</strong> {{ event.organizerName }}</p>
      <button @click="$emit('toggle-edit-delete')" class="edit-btn">編集・削除</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["isModalVisible", "event"],
};
</script>