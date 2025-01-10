<template>
    <v-dialog v-model="isVisible" max-width="600">
      <v-card>
        <v-card-title>{{ event.title }}</v-card-title>
        <v-card-text>
          <p><strong>日付:</strong> {{ event.start.toLocaleDateString() }}</p>
          <p><strong>時間:</strong> {{ event.start.toLocaleTimeString() }} - {{ event.end.toLocaleTimeString() }}</p>
          <p><strong>場所:</strong> {{ event.location }}</p>
          <p><strong>概要:</strong> {{ event.description }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="$emit('close')">閉じる</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  export default {
    props: ["event"],
    data() {
      return {
        isVisible: true,
      };
    },
  };
  </script>
  