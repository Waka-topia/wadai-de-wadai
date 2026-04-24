<template>
  <v-container fluid class="event-root">
    <!-- Back -->
    <v-btn icon variant="text" class="mb-2" @click="handleBack">
      <v-icon>mdi-arrow-left</v-icon>
    </v-btn>

    <v-alert
      v-if="fetchErrorMessage"
      type="error"
      variant="tonal"
      class="mb-4"
      icon="mdi-alert-circle"
    >
      {{ fetchErrorMessage }}
    </v-alert>

    <v-card
      v-else-if="event.eventId"
      rounded="lg"
      variant="outlined"
      style="border-width: 2px; border-color: #bdbdbd"
    >
      <!-- Title + ステータスバッジ -->
      <v-card-title class="pa-5 pb-2">
        <div class="d-flex align-center flex-wrap ga-2">
          <span class="text-h5 font-weight-bold">{{ event.title }}</span>
          <v-chip
            v-if="event.isOfficial"
            size="small"
            color="blue"
            variant="flat"
            label
            class="font-weight-bold"
          >
            <v-icon start size="14">mdi-check-decagram</v-icon>
            公式
          </v-chip>
          <v-chip
            v-if="isProxyEvent"
            size="small"
            color="orange"
            variant="flat"
            label
            class="font-weight-bold text-white"
          >
            <v-icon start size="14">mdi-clipboard-text-outline</v-icon>
            代理登録
          </v-chip>
        </div>
      </v-card-title>

      <v-card-text class="px-5 pb-5 mb-3">
        <!-- Meta blocks -->
        <v-list-item class="px-0">
          <template #prepend>
            <v-avatar color="orange" size="40" rounded="lg">
              <v-icon color="white" size="20">mdi-account-group</v-icon>
            </v-avatar>
          </template>
          <v-list-item-subtitle class="text-caption text-uppercase"> 団体名 </v-list-item-subtitle>
          <v-list-item-title class="font-weight-bold">
            {{ event.organizerName }}
          </v-list-item-title>
        </v-list-item>

        <v-divider thickness="2" color="grey-darken-1" />

        <v-list lines="two" class="pa-0">
          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-calendar</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 日付 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.date }}
            </v-list-item-title>
          </v-list-item>

          <v-divider thickness="2" color="grey-darken-1" />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-clock</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 時間 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.startTime }} – {{ event.endTime }}
            </v-list-item-title>
          </v-list-item>

          <v-divider thickness="2" color="grey-darken-1" />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-map-marker</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 場所 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold">
              {{ event.location }}
            </v-list-item-title>
          </v-list-item>

          <v-divider thickness="2" color="grey-darken-1" />

          <div class="d-flex align-start ga-4 px-0 py-2">
            <v-avatar color="orange" size="40" rounded="lg" class="flex-shrink-0 mt-1">
              <v-icon color="white" size="20">mdi-text-long</v-icon>
            </v-avatar>
            <div>
              <div class="text-caption text-uppercase text-medium-emphasis mb-1">概要</div>
              <div class="font-weight-bold text-wrap" style="line-height: 1.6">
                {{ event.description }}
              </div>
            </div>
          </div>

          <v-divider thickness="2" color="grey-darken-1" />
        </v-list>
        <div class="text-right mt-2">
          <span class="text-caption text-grey-lighten-1">
            作成者: {{ event.createdByName || '匿名ユーザー' }}
          </span>
        </div>
      </v-card-text>

      <!-- 運営代理登録の引き継ぎ誘導 (3ステップガイド形式) -->
      <div v-if="isProxyEvent" class="px-5 pb-4">
        <v-card color="orange-lighten-5" rounded="lg" variant="flat" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="orange" size="28" class="mr-2 flex-shrink-0">
              <v-icon color="white" size="16">mdi-hand-wave</v-icon>
            </v-avatar>
            <p class="text-body-2 font-weight-bold mb-0">このイベントを引き継ぎませんか？</p>
          </div>

          <!-- 3ステップ -->
          <div class="d-flex align-center justify-center ga-1 mb-3 flex-nowrap">
            <div class="step-item text-center">
              <v-avatar color="orange" size="22" class="mb-1">
                <span class="step-num font-weight-bold text-white">1</span>
              </v-avatar>
              <p class="step-label font-weight-bold mb-0">引き継ぎ申請</p>
            </div>
            <v-icon size="14" color="grey-darken-1">mdi-chevron-right</v-icon>
            <div class="step-item text-center">
              <v-avatar color="blue" size="22" class="mb-1">
                <span class="step-num font-weight-bold text-white">2</span>
              </v-avatar>
              <p class="step-label font-weight-bold mb-0">公式マーク付与</p>
            </div>
            <v-icon size="14" color="grey-darken-1">mdi-chevron-right</v-icon>
            <div class="step-item text-center">
              <v-avatar color="green" size="22" class="mb-1">
                <span class="step-num font-weight-bold text-white">3</span>
              </v-avatar>
              <p class="step-label font-weight-bold mb-0">自由に編集</p>
            </div>
          </div>

          <v-btn
            color="orange"
            variant="elevated"
            block
            class="text-white font-weight-bold"
            rounded="lg"
            @click="onClaimClick"
          >
            引き継ぎ申請へ進む
            <v-icon class="position-absolute right-0 mx-2">mdi-chevron-right</v-icon>
          </v-btn>
        </v-card>
      </div>

      <!-- 編集・削除ボタン -->
      <div v-if="canEdit" class="d-flex flex-column ga-3 px-5 pb-5">
        <v-btn
          color="grey-darken-3"
          class="font-weight-bold"
          variant="flat"
          rounded="pill"
          @click="editSheetOpen = true"
        >
          <v-icon start>mdi-pencil</v-icon>
          このイベントを編集する
        </v-btn>
        <v-btn
          color="red-lighten-1"
          class="font-weight-bold"
          variant="flat"
          rounded="pill"
          @click="deleteSheetOpen = true"
        >
          <v-icon start>mdi-delete</v-icon>
          削除する
        </v-btn>
        <p class="text-caption text-grey text-center mb-0">
          ※作成者本人、または団体の代表者のみ操作できます
        </p>
      </div>
    </v-card>

    <v-card v-else rounded="lg" elevation="2" class="pa-6 text-center">
      <v-progress-circular indeterminate color="orange" size="28" class="mr-2" />
      読み込み中...
    </v-card>

    <ClaimEventDialog
      v-model="claimDialogOpen"
      :event-id="eventId"
      :event-organizer="event.organizerName || ''"
      :organization-id="event.organizationId || ''"
      @transferred="onTransferred"
    />

    <EditEventSheet v-model="editSheetOpen" :event="event" />

    <BaseBottomSheet v-model="deleteSheetOpen" title="イベントの削除">
      <v-card-text>このイベントを削除します。本当によろしいですか？</v-card-text>
      <v-card-actions class="pa-4 pt-0">
        <v-btn class="flex-grow-1" variant="text" @click="deleteSheetOpen = false"
          >キャンセル</v-btn
        >
        <v-divider vertical style="border-color: #000000; opacity: 1" />
        <v-btn class="flex-grow-1 font-weight-bold" color="red" variant="text" @click="onDelete">
          削除する
        </v-btn>
      </v-card-actions>
    </BaseBottomSheet>
  </v-container>
</template>

<script setup>
import { useStore } from 'vuex'
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { adminUserId } from '@/config/constants'
import { hashValue } from '@/utils/crypto'
import { isUserRepresentative } from '@/services/groupService'
import { useSnackbar } from '@/composables/useSnackbar'
import BaseBottomSheet from '@/components/common/BaseBottomSheet.vue'
import ClaimEventDialog from '@/components/event/ClaimEventDialog.vue'
import EditEventSheet from '@/components/event/EditEventSheet.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { showSnackbar } = useSnackbar()
const fetchErrorMessage = ref('')
const claimDialogOpen = ref(false)
const editSheetOpen = ref(false)
const deleteSheetOpen = ref(false)

const event = computed(() => {
  return store.getters['event/event'] || {}
})

const eventId = computed(() => String(route.params.id || ''))

const isLoggedIn = computed(() => !!store.getters['auth/userId'])
const currentUserId = computed(() => store.getters['auth/userId'])

const hashedAdminId = ref('')
const hashedCurrentUserId = ref('')
const isRepresentative = ref(false)

/** ハッシュ化したIDをあらかじめ計算しておく */
onMounted(async () => {
  hashedAdminId.value = await hashValue(adminUserId)
  if (currentUserId.value) {
    hashedCurrentUserId.value = await hashValue(currentUserId.value)
  }
})

/** ユーザーがそのイベントの特定団体の代表者かどうかを確認する */
const checkRepresentativeStatus = async () => {
  if (currentUserId.value && event.value.organizationId) {
    isRepresentative.value = await isUserRepresentative(
      event.value.organizationId,
      currentUserId.value,
    )
  } else {
    isRepresentative.value = false
  }
}

// イベントデータ（特に団体ID）が変更されたら権限を再チェック
watch(
  () => event.value?.organizationId,
  () => {
    checkRepresentativeStatus()
  },
)

/** イベントが運営による代理登録かどうかを判定する */
const isProxyEvent = computed(() => {
  return event.value.createdBy === hashedAdminId.value
})

/** 編集・削除権限があるかどうかを判定する (作成者本人 or 管理者 or 団体の代表者) */
const canEdit = computed(() => {
  if (!isLoggedIn.value) return false
  if (hashedCurrentUserId.value === hashedAdminId.value) return true // 運営は何でも消せる

  // 団体の代表者かつ公式イベントなら許可
  if (event.value.isOfficial && isRepresentative.value) return true

  return event.value.createdBy === hashedCurrentUserId.value
})

useFirebasePageView('view_event_detail', () => ({
  eventId: eventId.value,
}))

const handleBack = () => {
  void logFirebaseAnalyticsEvent('event_detail_back_click', { eventId: eventId.value })
  router.back()
}

/** 引き継ぎボタンの遷移先を、代表者かどうかで振り分ける */
const onClaimClick = () => {
  void logFirebaseAnalyticsEvent('event_detail_claim_click', { eventId: eventId.value })
  // 代表者はダイアログで引き継ぎを実行する。それ以外は代表者証明へ（未ログインはガードでログインへ）
  if (isRepresentative.value) {
    claimDialogOpen.value = true
    return
  }
  router.push('/prove-owner')
}

const onTransferred = () => {
  // 引き継ぎ完了後にイベントデータを再取得して画面を更新
  store.dispatch('event/fetchEvent', eventId.value)
}

const onDelete = async () => {
  try {
    const currentUserId = store.getters['auth/userId']
    void logFirebaseAnalyticsEvent('event_detail_delete_confirm', { eventId: eventId.value })
    await store.dispatch('event/deleteEvent', { eventId: eventId.value, currentUserId })
    showSnackbar('イベントが正常に削除されました。', 'success', { icon: 'mdi-check-circle' })
    deleteSheetOpen.value = false
    setTimeout(() => {
      router.push('/eventcal')
    }, 500)
  } catch (error) {
    deleteSheetOpen.value = false
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  }
}

onMounted(async () => {
  try {
    await store.dispatch('event/fetchEvent', eventId.value)
    // イベント取得後に代表者ステータスを確認
    await checkRepresentativeStatus()
  } catch (error) {
    fetchErrorMessage.value = error.message
  }
})
</script>

<style scoped>
.event-root {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 40px;
}

.step-label {
  font-size: 10px;
  white-space: nowrap;
}

.step-num {
  font-size: 10px;
}
</style>
