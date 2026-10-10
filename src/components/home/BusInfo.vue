<template>
  <div class="mb-6">
    <SectionHeader title="バス情報" icon="mdi-bus" icon-color="#1976D2" />

    <TransitRouteCard
      v-for="route in routes"
      :key="route.key"
      :label="route.label"
      :color="route.color"
      accent-color="blue"
      :timetable-url="timetableUrl"
      :next="departures[route.key]?.next"
      :following="departures[route.key]?.following"
      @toggle="(expanded) => onToggle(route.key, expanded)"
    >
      <template #badges="{ departure }">
        <div v-if="getBusBadges(departure).length > 0" class="d-flex align-center mr-2">
          <v-chip
            v-for="badge in getBusBadges(departure)"
            :key="badge.label"
            size="small"
            :color="badge.color"
            class="font-weight-bold mr-1"
            label
          >
            {{ badge.label }}
          </v-chip>
        </div>
      </template>
    </TransitRouteCard>
  </div>
</template>

<script setup>
import { useDepartureCountdown } from '@/composables/useDepartureCountdown'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import SectionHeader from '@/components/common/SectionHeader.vue'
import TransitRouteCard from '@/components/home/TransitRouteCard.vue'

const timetableUrl = 'https://transfer-cloud.navitime.biz/wakayamabus/courses?busstop=00220063'

const routes = [
  { key: 'BusUniv', label: '和歌山大学→和歌山大学前駅・ふじと台', color: '#42A5F5' },
  { key: 'BusJr', label: '和歌山大学→JR和歌山駅', color: '#0D47A1' },
]

const departures = useDepartureCountdown(routes.map((route) => route.key))

/**
 * 便の行き先・経由地からバッジを作る
 *
 * @param {object} departure - TimetableService の便データ
 * @returns {{ label: string; color: string }[]} 表示するバッジ
 */
const getBusBadges = (departure) => {
  const badges = []
  const features = departure.features || []

  // BusUniv: 駅止まり
  if (departure.dest === 'station_only') {
    badges.push({ label: '駅止', color: 'red' })
  }
  // BusUniv: ふじと台行き（通常）
  if (departure.dest === 'fujitodai') {
    badges.push({ label: 'ふじと台 (和大前駅経由)', color: 'teal' })
  }
  // BusJr: 延時経由
  if (features.includes('via_nobutoki')) {
    badges.push({ label: '延時・市役所', color: 'blue-grey' })
  }
  // BusJr: 次郎丸経由
  if (features.includes('via_jiromaru')) {
    badges.push({ label: '次郎丸', color: 'brown' })
  }

  return badges
}

const onToggle = (routeKey, expanded) => {
  void logFirebaseAnalyticsEvent('home_bus_route_toggle', { routeKey, expanded })
}
</script>
