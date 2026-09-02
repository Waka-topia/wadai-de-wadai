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
          <!--
            2025年のイベントは団体単位で登録されており createdByName を持たない。
            その場合は団体名を作成者として表示する。
          -->
          <span class="text-caption text-grey-lighten-1">
            作成者: {{ event.createdByName || event.organizerName || '匿名ユーザー' }}
          </span>
        </div>
      </v-card-text>

      <!-- Danger action -->
      <EditDeleteForm v-if="canEdit" :event-id="eventId" :event="event" />
    </v-card>

    <v-card v-else rounded="lg" elevation="2" class="pa-6 text-center">
      <v-progress-circular indeterminate color="orange" size="28" class="mr-2" />
      読み込み中...
    </v-card>
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

const route = useRoute()
const router = useRouter()
const store = useStore()
const fetchErrorMessage = ref('')

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
