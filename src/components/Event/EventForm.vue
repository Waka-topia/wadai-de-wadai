<template>
    <div class="event-form">
      <v-form>
        <v-text-field label="日付" v-model="event.date" required></v-text-field>
        <v-time-picker label="開始時間" v-model="event.startTime"></v-time-picker>
        <v-time-picker label="終了時間" v-model="event.endTime"></v-time-picker>
        <v-text-field label="場所" v-model="event.location" required></v-text-field>
        <v-textarea label="概要" v-model="event.description"></v-textarea>
        <v-btn color="primary" @click="submit">登録</v-btn>
        <v-btn color="error" @click="$emit('close')">キャンセル</v-btn>
      </v-form>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        event: {
          date: "",
          startTime: "",
          endTime: "",
          location: "",
          description: "",
        },
      };
    },
    methods: {
      submit() {
        this.$emit("submitEvent", this.event);
      },
    },
  };
  </script>
  