import { onMounted, onUnmounted, ref } from 'vue'
import timetableService from '@/services/timetableService'

/**
 * 路線ごとの「次の便」と「その次の便」を 1 秒ごとに更新するコンポーザブル
 *
 * @param {string[]} routeKeys - TimetableService の路線キー（例: 'BusUniv'）
 * @returns {import('vue').Ref<Record<string, { next: object | null; following: object | null }>>}
 *   路線キーごとの次の便とその次の便（便が無いときは null）
 */
export const useDepartureCountdown = (routeKeys) => {
  const departures = ref({})

  const update = () => {
    departures.value = Object.fromEntries(
      routeKeys.map((key) => {
        const [next = null, following = null] = timetableService.getNextDepartures(key, 2)
        return [key, { next, following }]
      }),
    )
  }

  let intervalId
  onMounted(() => {
    update()
    // 秒単位でカウントダウンするため 1 秒ごとに更新する
    intervalId = setInterval(update, 1000)
  })
  onUnmounted(() => {
    if (intervalId) clearInterval(intervalId)
  })

  return departures
}
