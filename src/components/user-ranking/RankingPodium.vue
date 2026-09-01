<template>
  <div class="podium d-flex align-end justify-center ga-2">
    <div v-for="slot in slots" :key="slot.rank" class="podium-slot" :class="slot.modifier">
      <template v-if="slot.entry">
        <v-img
          :src="slot.ribbon"
          :alt="`${slot.rank}位`"
          class="ribbon mx-auto"
          :width="slot.ribbonSize"
        />
        <v-avatar :size="slot.avatarSize" class="my-2">
          <v-img :src="defaultIcon" alt="ユーザーアイコン" />
        </v-avatar>
        <p class="text-body-2 font-weight-bold text-center mb-1 podium-name">
          {{ slot.entry.displayName }}
        </p>
        <p class="text-center mb-0">
          <v-icon color="red" size="16">mdi-stamper</v-icon>
          <span class="text-red font-weight-bold ml-1">{{ slot.entry.stampCount }}</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ribbonGold from '@/assets/rankings/ribbon1.png'
import ribbonSilver from '@/assets/rankings/ribbon2.png'
import ribbonBronze from '@/assets/rankings/ribbon3.png'
import defaultIcon from '@/assets/userIcon/defaultIcon.png'

const props = defineProps({
  /** 上位3件のランキングエントリ（rank 昇順） */
  entries: {
    type: Array,
    required: true,
  },
})

/** 表彰台の並びは 2位 / 1位 / 3位。1位を中央かつ一段高く見せる */
const slots = computed(() => {
  const byRank = new Map(props.entries.map((entry) => [entry.rank, entry]))

  return [
    {
      rank: 2,
      ribbon: ribbonSilver,
      avatarSize: 88,
      ribbonSize: 56,
      modifier: 'podium-slot--side',
    },
    { rank: 1, ribbon: ribbonGold, avatarSize: 120, ribbonSize: 72, modifier: 'podium-slot--top' },
    {
      rank: 3,
      ribbon: ribbonBronze,
      avatarSize: 88,
      ribbonSize: 56,
      modifier: 'podium-slot--side',
    },
  ].map((slot) => ({ ...slot, entry: byRank.get(slot.rank) ?? null }))
})
</script>

<style scoped>
.podium {
  padding: 8px 0 16px;
}

.podium-slot {
  flex: 1 1 0;
  max-width: 148px;
  min-height: 1px;
}

.podium-slot--top {
  padding-bottom: 16px;
}

.podium-name {
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
