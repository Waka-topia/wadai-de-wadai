<template>
  <v-form class="pa-4" @submit.prevent="submitEvent">
    <v-select
      v-model="newEvent.organizerName"
      :items="allGroups"
      item-title="name"
      item-value="name"
      label="団体名"
      variant="outlined"
      density="comfortable"
      required
      persistent-hint
      prepend-inner-icon="mdi-domain"
    />

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

    <v-btn type="submit" color="orange" block size="large" class="text-white font-weight-bold mt-2">
      <v-icon start>mdi-check-circle</v-icon>
      イベントを登録
    </v-btn>
    <div class="text-center pt-4">
      <v-btn
        variant="text"
        class="text-button text-decoration-underline"
        @click="goProveOwnerFromEventForm"
      >
        団体の代表者であることを証明する
      </v-btn>
    </div>
    <p class="text-grey text-caption">
      代表者証明をすることでイベントが上位に表示されやすくなります
    </p>
  </v-form>

  <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
    {{ snackbar.message }}
  </v-snackbar>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { allGroups } from '@/data/groups'

const store = useStore()
const router = useRouter()

const goProveOwnerFromEventForm = () => {
  void logFirebaseAnalyticsEvent('event_form_prove_owner_link_click', {})
  router.push('/prove-owner')
}

const newEvent = ref({
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  organizerName: '',
})

const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const submitEvent = async () => {
  try {
    const currentUserId = store.getters['auth/userId']
    const currentUserName = store.getters['auth/displayName']
    const selectedGroup = allGroups.find((group) => group.name === newEvent.value.organizerName)

    if (!selectedGroup) {
      throw new Error('団体の選択が不正です。もう一度選択してください。')
    }

    const eventData = {
      ...newEvent.value,
      organizationId: String(selectedGroup.id),
    }

    await store.dispatch('event/createEvent', {
      eventData,
      currentUserId,
      currentUserName,
    })
    void logFirebaseAnalyticsEvent('event_form_submit_success', {
      organizationId: eventData.organizationId,
    })
    snackbar.value = {
      show: true,
      color: 'success',
      message: 'イベントが正常に登録されました！',
    }
  } catch (error) {
    void logFirebaseAnalyticsEvent('event_form_submit_error', {})
    snackbar.value = {
      show: true,
      color: 'error',
      message: error.message,
    }
  }
}
</script>
