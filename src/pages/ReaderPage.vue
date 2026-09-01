<template>
  <div v-if="isAuthenticated" class="pa-4 pt-6">
    <QrCodeScanner
      :paused="isPaused"
      @detected="onDetected"
      @invalid="onInvalid"
      @error="onScannerError"
    />

    <StampRewardDialog
      v-model="isRewardOpen"
      :granted="lastGranted"
      :stamp="lastStamp"
      :owned-count="ownedCount"
      :total-count="totalCount"
    />
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import QrCodeScanner from '@/components/qr-reader/QrCodeScanner.vue'
import StampRewardDialog from '@/components/qr-reader/StampRewardDialog.vue'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useSnackbar } from '@/composables/useSnackbar'
import { useStampCollection } from '@/composables/useStampCollection'
import { findStamp, stampImageUrl } from '@/data/stamps'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { grantStamp } from '@/services/stampService'

const store = useStore()
const { showSnackbar } = useSnackbar()

useFirebasePageView('view_reader', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userId = computed(() => store.getters['auth/userId'])
const displayName = computed(() => store.getters['auth/displayName'])

const { ownedCount, totalCount, reload } = useStampCollection(userId)

const isRewardOpen = ref(false)
const isProcessing = ref(false)
const lastGranted = ref(true)
const lastStamp = ref(null)

// 獲得ダイアログを表示している間と保存処理中はスキャンを止める
const isPaused = computed(() => isRewardOpen.value || isProcessing.value)

/**
 * QRコードを読み取れたときにスタンプを付与する
 *
 * @param {{ groupId: string; stampId: string }} payload - 読み取ったペイロード
 */
const onDetected = async ({ groupId, stampId }) => {
  if (isProcessing.value) return
  isProcessing.value = true

  try {
    const result = await grantStamp({
      userId: userId.value,
      displayName: displayName.value,
      groupId,
      stampId,
    })

    const master = findStamp(stampId)
    lastStamp.value = { ...master, imageUrl: stampImageUrl(stampId) }
    lastGranted.value = result.granted

    if (result.granted) {
      await reload()
      void logFirebaseAnalyticsEvent('stamp_granted', { stampId, groupId })
    }

    isRewardOpen.value = true
  } catch (error) {
    showSnackbar(error.message, 'error', { icon: 'mdi-alert-circle' })
  } finally {
    isProcessing.value = false
  }
}

const onInvalid = () => {
  showSnackbar('スタンプのQRコードとして読み取れませんでした。', 'warning', {
    icon: 'mdi-qrcode-remove',
  })
}

/**
 * カメラ起動に失敗したときの通知
 *
 * @param {string} message - 日本語のエラーメッセージ
 */
const onScannerError = (message) => {
  showSnackbar(message, 'error', { icon: 'mdi-camera-off' })
}

// ログアウトした場合はダイアログを閉じる
watch(isAuthenticated, (authenticated) => {
  if (!authenticated) isRewardOpen.value = false
})
</script>
