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
      <!-- Title -->
      <v-card-title class="text-h5 font-weight-bold pa-5 pb-2">
        {{ event.title }}
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

      <!-- 運営代理登録の引き継ぎ誘導 -->
      <div v-if="isProxyEvent" class="px-5 pb-4">
        <v-card variant="outlined" color="orange" rounded="lg" class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon color="orange" class="mr-2">mdi-clipboard-text-outline</v-icon>
            <p class="text-body-1 font-weight-bold mb-0">この新歓情報は代理登録です</p>
          </div>
          <p class="text-body-2 mb-3 text-grey-darken-2">
            Waka-topiaが大学公式カレンダーを元に代理登録しました。団体の代表者は管理権限を引き継いで、内容を自由に編集できます。
          </p>

          <v-alert
            variant="tonal"
            color="blue"
            icon="mdi-star-circle"
            density="compact"
            class="mb-3"
          >
            <div class="text-body-2">
              <span class="font-weight-bold">引き継ぎのメリット:</span>
              内容を自由に編集 / 公式マーク付きで上位表示 / 最新情報を直接発信
            </div>
          </v-alert>

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
      <EditDeleteForm :event-id="eventId" />
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
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { adminUserId } from '@/config/constants'
import EditDeleteForm from '@/components/event/EditDeleteForm.vue'
import ClaimEventDialog from '@/components/event/ClaimEventDialog.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const fetchErrorMessage = ref('')
const claimDialogOpen = ref(false)

const eventId = computed(() => String(route.params.id || ''))

const isLoggedIn = computed(() => !!store.getters['auth/userId'])

/** イベントが運営による代理登録かどうかを判定する */
const isProxyEvent = computed(() => event.value.createdBy === adminUserId)

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
  } catch (error) {
    fetchErrorMessage.value = error.message
  }
})

const event = computed(() => {
  return store.getters['event/event'] || {}
})
</script>

<style scoped>
.event-root {
  max-width: 720px;
  margin: 0 auto;
  padding: 8px 16px 40px;
}
</style>
