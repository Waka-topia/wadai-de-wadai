<template>
  <v-form class="pa-3 event-form-modern" @submit.prevent="submitEvent">
    <!-- セクション：基本情報 -->
    <div class="form-section mb-2">
      <div class="d-flex align-center mb-1">
        <v-icon color="orange" class="mr-2">mdi-information-outline</v-icon>
        <span class="text-subtitle-1 font-weight-bold">基本情報</span>
      </div>

      <v-autocomplete
        v-model="newEvent.organizerName"
        :items="allGroups"
        item-title="name"
        item-value="name"
        label="団体名"
        variant="outlined"
        density="compact"
        :rules="[required]"
        persistent-hint
        prepend-inner-icon="mdi-domain"
        no-data-text="団体が見つかりません。正しい名称を入力してください。"
        clearable
        rounded="lg"
        bg-color="grey-lighten-5"
        class="mb-1"
      />

      <v-text-field
        v-model="newEvent.location"
        label="場所"
        variant="outlined"
        density="compact"
        placeholder="イベントの場所（教室、オンライン等）"
        :rules="[required]"
        prepend-inner-icon="mdi-map-marker"
        rounded="lg"
        bg-color="grey-lighten-5"
      />
    </div>

    <!-- セクション：日時 -->
    <div class="form-section mb-2">
      <div class="d-flex align-center mb-1">
        <v-icon color="blue" class="mr-2">mdi-calendar-clock</v-icon>
        <span class="text-subtitle-1 font-weight-bold">日時設定</span>
      </div>

      <v-text-field
        v-model="newEvent.date"
        label="開催日"
        type="date"
        variant="outlined"
        density="compact"
        max="2026-05-31"
        min="2025-04-01"
        :rules="[required]"
        prepend-inner-icon="mdi-calendar"
        rounded="lg"
        bg-color="grey-lighten-5"
        class="mb-1"
      />

      <v-row dense>
        <v-col cols="6">
          <v-text-field
            v-model="newEvent.startTime"
            label="開始時間"
            type="time"
            variant="outlined"
            density="compact"
            :rules="[required]"
            prepend-inner-icon="mdi-clock-start"
            rounded="lg"
            bg-color="grey-lighten-5"
          />
        </v-col>
        <v-col cols="6">
          <v-text-field
            v-model="newEvent.endTime"
            label="終了時間"
            type="time"
            variant="outlined"
            density="compact"
            :rules="[required]"
            prepend-inner-icon="mdi-clock-end"
            rounded="lg"
            bg-color="grey-lighten-5"
          />
        </v-col>
      </v-row>
    </div>

    <!-- セクション：説明文 -->
    <div class="form-section mb-3">
      <div class="d-flex align-center mb-1">
        <v-icon color="green" class="mr-2">mdi-text-box-outline</v-icon>
        <span class="text-subtitle-1 font-weight-bold">イベントの紹介</span>
      </div>

      <v-textarea
        v-model="newEvent.description"
        label="概要"
        variant="outlined"
        density="compact"
        rows="4"
        placeholder="イベントの見どころ、対象、持ち物などを入力"
        prepend-inner-icon="mdi-text"
        rounded="lg"
        bg-color="grey-lighten-5"
        persistent-placeholder
      />
    </div>

    <!-- アクションエリア -->
    <v-btn
      type="submit"
      color="orange-darken-1"
      block
      size="x-large"
      elevation="4"
      class="text-white font-weight-bold submit-btn mb-2"
      rounded="xl"
    >
      <v-icon start size="22">{{ isEditMode ? 'mdi-update' : 'mdi-check-circle-outline' }}</v-icon>
      <span class="text-button">{{ isEditMode ? '情報を更新する' : 'この内容で登録する' }}</span>
    </v-btn>

    <!-- 代表者証明への案内 -->
    <v-card
      variant="tonal"
      color="grey-darken-1"
      rounded="lg"
      class="pa-4 prove-guide-card text-center"
      @click="goProveOwnerFromEventForm"
    >
      <div class="d-flex align-center justify-center mb-1">
        <v-icon size="18" class="mr-2">mdi-shield-check-outline</v-icon>
        <span class="text-body-2 font-weight-bold"> 団体の代表者の証明はお済みですか？ </span>
      </div>
      <p class="text-caption mb-2 opacity-80">
        証明を完了すると「公式マーク」が付与され、優先的に表示されます
      </p>
      <v-btn
        variant="outlined"
        size="small"
        rounded="pill"
        class="text-none font-weight-bold px-4"
        color="orange-darken-2"
      >
        代表者証明を始める
      </v-btn>
    </v-card>
  </v-form>

  <v-snackbar
    v-model="snackbar.show"
    :color="snackbar.color"
    timeout="3000"
    rounded="lg"
    elevation="6"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">
        {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert' }}
      </v-icon>
      {{ snackbar.message }}
    </div>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { allGroups } from '@/data/groups'
import { required } from '@/utils/forms/validate'

const props = defineProps({
  /** 編集時の初期データ（新規登録時はnull） */
  initialEvent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'cancel'])

const store = useStore()
const router = useRouter()

const goProveOwnerFromEventForm = () => {
  void logFirebaseAnalyticsEvent('event_form_prove_owner_link_click', {})
  emit('cancel') // フォーム（ダイアログ）を閉じるために通知
  router.push('/prove-owner')
}

const isEditMode = computed(() => !!props.initialEvent)

const newEvent = ref({
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  organizerName: '',
})

/** 初期入力を初期イベントから同期する */
const syncInitialData = () => {
  if (props.initialEvent) {
    newEvent.value = {
      date: props.initialEvent.date || '',
      startTime: props.initialEvent.startTime || '',
      endTime: props.initialEvent.endTime || '',
      location: props.initialEvent.location || '',
      description: props.initialEvent.description || '',
      organizerName: props.initialEvent.organizerName || '',
    }
  }
}

// 初期化時とプロパティ変更時に同期を実行
watch(
  () => props.initialEvent,
  () => {
    syncInitialData()
  },
  { immediate: true, deep: true },
)

const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

const submitEvent = async (validationPromise) => {
  try {
    const { valid } = await validationPromise
    if (!valid) throw new Error('入力に誤りがあります。')

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

    if (isEditMode.value) {
      await store.dispatch('event/updateEvent', {
        eventData,
        currentUserId,
      })
    } else {
      await store.dispatch('event/createEvent', {
        eventData,
        currentUserId,
        currentUserName,
      })
    }
    void logFirebaseAnalyticsEvent(
      isEditMode.value ? 'event_form_update_success' : 'event_form_submit_success',
      {
        organizationId: eventData.organizationId,
      },
    )
    snackbar.value = {
      show: true,
      color: 'success',
      message: isEditMode.value ? 'イベントを更新しました！' : 'イベントが正常に登録されました！',
    }

    // 成功イベントを通知（ダイアログを閉じるためなど）
    emit('success')
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

<style scoped>
.event-form-modern {
  max-width: 600px;
  margin: 0 auto;
}

.form-section {
  position: relative;
}

.submit-btn {
  height: 56px !important;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

.prove-guide-card {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.prove-guide-card:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}

/* Chromeのオートフィルなどの背景色が白くなるのを防ぐための気休め */
:deep(.v-field__input) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
</style>
