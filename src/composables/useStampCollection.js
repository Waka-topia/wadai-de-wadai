import { computed, ref, watch } from 'vue'
import { stampImageUrl, stampMaster } from '@/data/stamps'
import { fetchReceivedStamps } from '@/services/stampService'

/**
 * ログインユーザーのスタンプコレクションを読み込むコンポーザブル
 *
 * 取得済みスタンプ（Firestore）と全スタンプのマスター（静的定義）を突き合わせ、 未取得のものも含めた 112 件を返す。マスターが手元にあるので Firestore への
 * 問い合わせは1回だけで済む。
 *
 * @param {import('vue').Ref<string>} userId - Firebase Auth の UID（リアクティブ）
 * @returns {object} スタンプ一覧と読み込み状態
 */
export const useStampCollection = (userId) => {
  const receivedMap = ref(new Map())
  const isLoading = ref(false)
  const errorMessage = ref('')

  /** 取得済みスタンプを読み込み直す */
  const reload = async () => {
    if (!userId.value) {
      receivedMap.value = new Map()
      return
    }

    isLoading.value = true
    errorMessage.value = ''

    try {
      const received = await fetchReceivedStamps(userId.value)
      receivedMap.value = new Map(received.map((stamp) => [stamp.stampId, stamp]))
    } catch (error) {
      errorMessage.value = error.message
    } finally {
      isLoading.value = false
    }
  }

  // UID は認証復元のタイミングで後から確定するため、確定を待って読み込む
  watch(userId, reload, { immediate: true })

  const stamps = computed(() =>
    stampMaster.map((stamp) => {
      const received = receivedMap.value.get(stamp.stampId)
      return {
        ...stamp,
        imageUrl: stampImageUrl(stamp.stampId),
        isOwned: Boolean(received),
        receivedAt: received?.receivedAt ?? null,
      }
    }),
  )

  const totalCount = computed(() => stampMaster.length)
  const ownedCount = computed(() => receivedMap.value.size)
  const progressRatio = computed(() =>
    totalCount.value === 0 ? 0 : (ownedCount.value / totalCount.value) * 100,
  )

  return { stamps, ownedCount, totalCount, progressRatio, isLoading, errorMessage, reload }
}
