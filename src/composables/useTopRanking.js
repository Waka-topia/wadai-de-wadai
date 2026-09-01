import { onUnmounted, ref } from 'vue'
import { subscribeTopRanking } from '@/services/rankingService'

/**
 * スタンプ数ランキングの上位をリアルタイムで購読するコンポーザブル
 *
 * スタンプを取得すると rankingEntries が増分更新されるため、 購読しているだけで順位が自動的に入れ替わる。
 *
 * @returns {object} ランキングの一覧と読み込み状態
 */
export const useTopRanking = () => {
  const entries = ref([])
  const isLoading = ref(true)
  const errorMessage = ref('')

  const unsubscribe = subscribeTopRanking({
    onChange: (nextEntries) => {
      entries.value = nextEntries
      isLoading.value = false
    },
    onError: (error) => {
      errorMessage.value = error.message
      isLoading.value = false
    },
  })

  // 購読を残したままページを離れると読み取りが走り続けるため必ず解除する
  onUnmounted(() => {
    unsubscribe()
  })

  return { entries, isLoading, errorMessage }
}
