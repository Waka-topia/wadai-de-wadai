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

    <v-card v-else-if="event.eventId" rounded="lg" elevation="2">
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

        <v-divider inset />

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

          <v-divider inset />

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

          <v-divider inset />

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

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="orange" size="40" rounded="lg" class="align-self-start mt-1">
                <v-icon color="white" size="20">mdi-text-long</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase"> 概要 </v-list-item-subtitle>
            <v-list-item-title class="font-weight-bold text-wrap" style="line-height: 1.6">
              {{ event.description }}
            </v-list-item-title>
          </v-list-item>

          <v-divider inset />

          <v-list-item class="px-0">
            <template #prepend>
              <v-avatar color="blue-grey" size="40" rounded="lg">
                <v-icon color="white" size="20">mdi-account-edit</v-icon>
              </v-avatar>
            </template>
            <v-list-item-subtitle class="text-caption text-uppercase">
              作成者
            </v-list-item-subtitle>
            <v-list-item-title class="font-weight-medium">
              {{ event.createdByName || '匿名ユーザー' }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card-text>

      <!-- 運営代理登録の引き継ぎ誘導 (3ステップガイド形式) -->
      <div v-if="isProxyEvent" class="px-5 pb-4">
        <v-card color="orange-lighten-5" rounded="lg" variant="flat" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar color="orange" size="32" class="mr-3">
              <v-icon color="white" size="18">mdi-hand-wave</v-icon>
            </v-avatar>
            <p class="text-body-1 font-weight-bold mb-0">
              このイベントを引き継ぎませんか？
            </p>
          </div>

          <!-- 3ステップ -->
          <div class="d-flex align-center justify-center ga-2 mb-3 flex-wrap">
            <div class="step-item text-center">
              <v-avatar color="orange" size="28" class="mb-1">
                <span class="text-caption font-weight-bold text-white">1</span>
              </v-avatar>
              <p class="text-caption font-weight-bold mb-0">引き継ぎ申請</p>
            </div>
            <v-icon size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
            <div class="step-item text-center">
              <v-avatar color="blue" size="28" class="mb-1">
                <span class="text-caption font-weight-bold text-white">2</span>
              </v-avatar>
              <p class="text-caption font-weight-bold mb-0">公式マーク付与</p>
            </div>
            <v-icon size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
            <div class="step-item text-center">
              <v-avatar color="green" size="28" class="mb-1">
                <span class="text-caption font-weight-bold text-white">3</span>
              </v-avatar>
              <p class="text-caption font-weight-bold mb-0">自由に編集</p>
            </div>
          </div>

          <v-btn
            v-if="isLoggedIn"
            color="orange"
            variant="elevated"
            block
            class="text-white font-weight-bold"
            @click="onClaimClick"
          >
            <v-icon start>mdi-swap-horizontal</v-icon>
            このイベントを引き継ぐ
          </v-btn>
          <v-btn
            v-else
            color="orange"
            variant="outlined"
            block
            class="font-weight-bold"
            to="/prove-owner"
          >
            <v-icon start>mdi-account-check</v-icon>
            代表者証明をして引き継ぐ
          </v-btn>
        </v-card>
      </div>

      <!-- Danger action -->
      <EditDeleteForm v-if="canEdit" :event-id="eventId" :event="event" />
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
import EditDeleteForm from '@/components/event/EditDeleteForm.vue'
import ClaimEventDialog from '@/components/event/ClaimEventDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const fetchErrorMessage = ref('')
const claimDialogOpen = ref(false)

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

const onClaimClick = () => {
  void logFirebaseAnalyticsEvent('event_detail_claim_click', { eventId: eventId.value })
  claimDialogOpen.value = true
}

const onTransferred = () => {
  // 引き継ぎ完了後にイベントデータを再取得して画面を更新
  store.dispatch('event/fetchEvent', eventId.value)
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
</style>
