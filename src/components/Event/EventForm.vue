/* EventForm.vue: イベント登録フォーム */
<template>
  <form @submit.prevent="submitEvent">
    <div class="form-group">
      <label for="date">日付:</label>
      <input type="date" v-model="newEvent.date" required />
    </div>
    <div class="form-group">
      <label for="start-time">開始時刻:</label>
      <input type="time" v-model="newEvent.startTime" required />
    </div>
    <div class="form-group">
      <label for="end-time">終了時刻:</label>
      <input type="time" v-model="newEvent.endTime" required />
    </div>
    <div class="form-group">
      <label for="location">場所:</label>
      <input type="text" v-model="newEvent.location" required />
    </div>
    <div class="form-group">
      <label for="description">概要:</label>
      <textarea v-model="newEvent.description" required></textarea>
    </div>
    <div class="form-group">
      <label for="organizer-name">団体名:</label>
      <input type="text" v-model="newEvent.organizerName" required />
    </div>
    <div class="form-group">
      <label for="organizer-id">団体ID:</label>
      <input type="text" v-model="organizerId" required />
    </div>
    <div class="form-group">
      <label for="password">パスワード:</label>
      <input type="password" v-model="password" required />
    </div>
    <button type="submit">イベントを登録</button>
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
      },
      organizerId: "",
      password: "",
    };
  },
  methods: {
    submitEvent() {
      this.$emit("submit-event", this.newEvent, this.organizerId, this.password);
    },
  },
};
</script>