<template>
  <div class="mb-6">
    <SectionHeader title="電車情報" icon="mdi-train" icon-color="#4CAF50" />

    <TransitRouteCard
      v-for="route in routes"
      :key="route.key"
      :label="route.label"
      :color="route.color"
      accent-color="green"
      :timetable-url="timetableUrl"
      :next="departures[route.key]?.next"
      :following="departures[route.key]?.following"
      @toggle="(expanded) => onToggle(route.key, expanded)"
    >
      <template #badges="{ departure }">
        <v-chip
          v-if="departure.type"
          size="small"
          :color="getTypeColor(departure.type)"
          class="font-weight-bold mr-2 text-truncate"
          style="max-width: 160px"
          label
        >
          {{ getTypeName(departure.type) }}
        </v-chip>
      </template>

      <template #following-prefix="{ departure }">
        <span class="text-caption font-weight-bold text-grey-darken-1 mr-2 text-truncate">
          {{ getTypeName(departure.type) }}
        </span>
      </template>

      <template #extra="{ departure }">
        <div v-if="(departure.features || []).includes('women_only')" class="mt-2 mb-1">
          <v-icon color="pink" size="small" class="mx-1" title="女性専用車両">
            mdi-human-female
          </v-icon>
          <span class="text-caption text-pink font-weight-bold">女性専用車両</span>
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

const timetableUrl = 'https://www.nankai.co.jp/traffic/jikoku-wa.html#wa'

const routes = [
  { key: 'TrainNamba', label: '和歌山大学前駅→なんば駅行き', color: '#4CAF50' },
  { key: 'TrainWakayamashi', label: '和歌山大学前駅→和歌山市駅行き', color: '#1B5E20' },
]

const departures = useDepartureCountdown(routes.map((route) => route.key))

const getTypeColor = (type) => {
  switch (type) {
    case 'limited_express_southern':
    case 'limited_express':
      return 'orange'
    case 'express':
      return 'red'
    case 'sub_express':
      return 'green'
    default:
      return 'grey'
  }
}

const getTypeName = (type) => {
  switch (type) {
    case 'limited_express_southern':
      return '特急サザン'
    case 'limited_express':
      return '特急'
    case 'express':
      return '急行'
    case 'sub_express':
      return '区急'
    default:
      return '普通'
  }
}

const onToggle = (routeKey, expanded) => {
  void logFirebaseAnalyticsEvent('home_train_route_toggle', { routeKey, expanded })
}
</script>
