<template>
  <v-form ref="formRef" class="pa-4" @submit.prevent="submit">
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
      :menu-props="groupMenuProps"
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
      :max="maxDate"
      :min="minDate"
      :rules="[required]"
      prepend-inner-icon="mdi-calendar"
    />

    <v-row dense>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="newEvent.startTime"
          label="開始時刻"
          type="time"
          variant="outlined"
          density="comfortable"
          bg-color="grey-lighten-4"
          base-color="grey-darken-2"
          :rules="[required]"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="newEvent.endTime"
          label="終了時刻"
          type="time"
          variant="outlined"
          density="comfortable"
          bg-color="grey-lighten-4"
          base-color="grey-darken-2"
          :rules="[required]"
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

    <!-- 送信はシート右上のチェックボタンから行う（type="submit" は Enter キー用に残す） -->
    <button class="d-none" type="submit"></button>
  </v-form>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { useVirtualKeyboard } from '@/composables/useVirtualKeyboard'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { allGroups } from '@/data/groups'
import { required } from '@/utils/forms/validate'
import { selectableMaxDate, selectableMinDate, toDateInputValue } from '@/utils/dateRange'

const props = defineProps({
  /** 編集時の初期データ（新規登録時はnull） */
  initialEvent: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['success', 'cancel'])

const store = useStore()

const isEditMode = computed(() => !!props.initialEvent)

const { isKeyboardOpen } = useVirtualKeyboard()

/**
 * 候補リストの出し方
 *
 * IOS Safari はキーボードが出てもビューポートが縮まないため、Vuetify が 「下に空きがある」と誤判定して候補をキーボードの裏に描画してしまう。
 * この項目はシート上部にあり下向きに開くので、キーボードが出ている間は その上に収まる高さに抑える。
 *
 * @returns {object} V-autocomplete に渡す menu-props
 */
const groupMenuProps = computed(() => ({ maxHeight: isKeyboardOpen.value ? 160 : 300 }))

// 固定値にすると年度をまたいだ時点でカレンダーから今日を選べなくなるため、今日を基準にする
const minDate = toDateInputValue(selectableMinDate())
const maxDate = toDateInputValue(selectableMaxDate())

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

const formRef = ref(null)

/**
 * 入力内容を検証して登録・更新を行う
 *
 * シート右上のチェックボタンから呼べるように defineExpose で公開している
 *
 * @returns {Promise<void>}
 */
const submit = async () => {
  try {
    const result = await formRef.value?.validate()
    if (!result?.valid) throw new Error('入力に誤りがあります。')

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

defineExpose({ submit })
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
