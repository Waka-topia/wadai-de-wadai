<template>
  <v-form class="pa-4" @submit.prevent="submitEvent($event)">
    <v-autocomplete
      v-model="newEvent.organizerName"
      :items="allGroups"
      item-title="name"
      item-value="name"
      label="団体名"
      variant="outlined"
      density="comfortable"
      bg-color="grey-lighten-4"
      base-color="grey-darken-2"
      :rules="[required]"
      persistent-hint
      prepend-inner-icon="mdi-domain"
      no-data-text="団体が見つかりません。一覧から選択するか正しい名称を入力してください。"
      clearable
    />

    <v-text-field
      v-model="newEvent.date"
      label="日付"
      type="date"
      variant="outlined"
      density="comfortable"
      bg-color="grey-lighten-4"
      base-color="grey-darken-2"
      max="2026-05-31"
      min="2025-04-01"
      :rules="[required]"
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
          bg-color="grey-lighten-4"
          base-color="grey-darken-2"
          :rules="[required]"
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
          bg-color="grey-lighten-4"
          base-color="grey-darken-2"
          :rules="[required]"
          prepend-inner-icon="mdi-clock-end"
        />
      </v-col>
    </v-row>

    <v-text-field
      v-model="newEvent.location"
      label="場所"
      variant="outlined"
      density="comfortable"
      bg-color="grey-lighten-4"
      base-color="grey-darken-2"
      placeholder="イベントの場所"
      :rules="[required]"
      prepend-inner-icon="mdi-map-marker"
    />

    <v-textarea
      v-model="newEvent.description"
      label="概要"
      variant="outlined"
      density="comfortable"
      bg-color="grey-lighten-4"
      base-color="grey-darken-2"
      rows="4"
      placeholder="イベントの概要を入力"
      prepend-inner-icon="mdi-text"
    />

    <v-btn
      type="submit"
      color="orange"
      block
      size="large"
      rounded="pill"
      class="text-white font-weight-bold text-body-2 mt-2"
      :disabled="!canSubmit"
    >
      {{ isEditMode ? 'このイベントを更新する' : 'このイベントを登録する' }}
    </v-btn>
    <div class="text-center pt-4">
      <v-btn
        block
        size="large"
        rounded="pill"
        color="red-lighten-1"
        class="text-white font-weight-bold text-body-2"
        @click="goProveOwnerFromEventForm"
      >
        団体の代表者であることを証明する
      </v-btn>
    </div>
    <p class="text-grey-darken-1 text-caption mt-3">
      ※代表者証明をすることでイベントが上位に表示されやすくなります
    </p>
  </v-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
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

const { showSnackbar } = useSnackbar()

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
    showSnackbar(
      isEditMode.value ? 'イベントを更新しました！' : 'イベントが正常に登録されました！',
      'success',
      { icon: 'mdi-check-circle' },
    )

    // 成功イベントを通知（ダイアログを閉じるためなど）
    emit('success')
  } catch (error) {
    void logFirebaseAnalyticsEvent('event_form_submit_error', {})
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  }
}

const isFormValid = computed(() => {
  return Boolean(
    newEvent.value.organizerName &&
    newEvent.value.date &&
    newEvent.value.startTime &&
    newEvent.value.endTime &&
    newEvent.value.location,
  )
})

const isChanged = computed(() => {
  if (!props.initialEvent) return true

  return (
    newEvent.value.organizerName !== (props.initialEvent.organizerName || '') ||
    newEvent.value.date !== (props.initialEvent.date || '') ||
    newEvent.value.startTime !== (props.initialEvent.startTime || '') ||
    newEvent.value.endTime !== (props.initialEvent.endTime || '') ||
    newEvent.value.location !== (props.initialEvent.location || '') ||
    newEvent.value.description !== (props.initialEvent.description || '')
  )
})

const canSubmit = computed(() => {
  if (isEditMode.value) {
    return isFormValid.value && isChanged.value
  }

  return isFormValid.value
})
</script>

<style scoped>
:deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-width: 2px;
}

:deep(.v-field:not(.v-field--focused) .v-label) {
  color: #616161;
  opacity: 1;
}
</style>
