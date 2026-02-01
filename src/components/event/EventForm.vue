<template>
  <v-form class="pa-4" @submit.prevent="submitEvent">
    <v-text-field
      v-model="newEvent.date"
      label="日付"
      type="date"
      variant="outlined"
      density="comfortable"
      max="2026-05-31"
      min="2025-04-01"
      required
      prepend-inner-icon="mdi-calendar"
    />

    <v-row dense>
      <v-col cols="6">
        <v-text-field
          v-model="newEvent.startTime"
          label="開始時刻"
          type="time"
          variant="outlined"
          density="comfortable"
          required
          prepend-inner-icon="mdi-clock-start"
        />
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="newEvent.endTime"
          label="終了時刻"
          type="time"
          variant="outlined"
          density="comfortable"
          required
          prepend-inner-icon="mdi-clock-end"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="newEvent.location"
      label="場所"
      variant="outlined"
      density="comfortable"
      placeholder="イベントの場所"
      required
      prepend-inner-icon="mdi-map-marker"
    />

    <v-textarea
      v-model="newEvent.description"
      label="概要"
      variant="outlined"
      density="comfortable"
      rows="4"
      placeholder="イベントの概要を入力"
      required
      prepend-inner-icon="mdi-text"
    />

    <v-divider class="my-4" />

    <div class="text-subtitle-1 font-weight-bold mb-3">
      <v-icon size="small" class="mr-1">mdi-account-group</v-icon>
      団体情報
    </div>

    <v-text-field
      v-model="newEvent.organizerName"
      label="団体名（略称可）"
      variant="outlined"
      density="comfortable"
      placeholder="団体名（略称可）"
      required
      prepend-inner-icon="mdi-domain"
    />

    <v-text-field
      v-model="organizerId"
      label="団体ID"
      variant="outlined"
      density="comfortable"
      placeholder="団体ID"
      required
      prepend-inner-icon="mdi-identifier"
    />

    <v-text-field
      v-model="password"
      label="パスワード"
      type="password"
      variant="outlined"
      density="comfortable"
      placeholder="パスワード"
      required
      prepend-inner-icon="mdi-lock"
    />

    <v-btn type="submit" color="orange" block size="large" class="text-white font-weight-bold mt-2">
      <v-icon start>mdi-check-circle</v-icon>
      イベントを登録
    </v-btn>
  </v-form>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const newEvent = ref({
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  organizerName: '',
  organizerId: '',
  password: '',
})

const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const submitEvent = async () => {
  try {
    await store.dispatch('event/createEvent', {
      eventData: newEvent.value,
      organizerId: newEvent.value.organizerId,
      password: newEvent.value.password,
    })
    snackbar.value = {
      show: true,
      color: 'success',
      message: 'イベントが正常に登録されました！',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: `イベントの登録に失敗しました: ${error.message}`,
    }
  }
}
</script>
