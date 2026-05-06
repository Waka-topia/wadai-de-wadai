// src/composables/useBusRealtime.js

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { findTargetBuses } from '@/utils/busMatcher'

export function useBusRealtime() {
  const realtimeBusData = ref(null)
  const targetBuses = ref({ routeUniv: null, routeJr: null })
  const isFetching = ref(false)
  const lastFetchTime = ref(Number(localStorage.getItem('bus_last_fetch') || 0))
  const cooldown = ref(0)
  let timer = null

  const canRefresh = computed(() => cooldown.value <= 0 && !isFetching.value)

  const updateCooldown = () => {
    const now = Date.now()
    const diff = Math.floor((now - lastFetchTime.value) / 1000)
    cooldown.value = Math.max(0, 60 - diff)
  }

  const fetchBusData = async (force = false) => {
    if (force && !canRefresh.value) return

    // キャッシュ確認（初回読み込み時）
    if (!force) {
      const cached = localStorage.getItem('bus_data_cache')
      if (cached && Date.now() - lastFetchTime.value < 60000) {
        const data = JSON.parse(cached)
        realtimeBusData.value = data
        targetBuses.value = findTargetBuses(data)
        return
      }
    }

    isFetching.value = true
    try {
      const docSnap = await getDoc(doc(db, 'busData', 'wakayama_latest'))
      if (docSnap.exists()) {
        const data = docSnap.data()
        realtimeBusData.value = data
        targetBuses.value = findTargetBuses(data)

        lastFetchTime.value = Date.now()
        localStorage.setItem('bus_last_fetch', lastFetchTime.value.toString())
        localStorage.setItem('bus_data_cache', JSON.stringify(data))
      }
    } catch (error) {
      console.error('❌ Firestoreからのバスデータ取得に失敗しました:', error)
    } finally {
      isFetching.value = false
      updateCooldown()
    }
  }

  onMounted(() => {
    fetchBusData()
    timer = setInterval(updateCooldown, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return {
    realtimeBusData,
    targetBuses,
    isFetching,
    cooldown,
    canRefresh,
    refresh: () => fetchBusData(true),
  }
}
