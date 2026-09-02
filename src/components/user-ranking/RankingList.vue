<template>
  <div>
    <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable">
      {{ errorMessage }}
    </v-alert>

    <template v-else-if="isLoading">
      <v-skeleton-loader v-for="n in 5" :key="n" type="list-item-avatar-three-line" />
    </template>

    <v-alert v-else-if="entries.length === 0" type="info" variant="tonal" density="comfortable">
      まだランキングデータがありません。
    </v-alert>

    <template v-else>
      <RankingProfileCard
        v-for="entry in visibleEntries"
        :key="entry.userId"
        :rank="entry.rank"
        :name="entry.displayName"
        :count="entry.stampCount"
        :icon-id="entry.iconId"
        :next-shinkan="entry.nextShinkan"
      />

      <div v-if="hasMore" class="text-center mt-4">
        <v-btn variant="tonal" color="orange" rounded="pill" @click="showAll = true">
          もっと見る（残り{{ entries.length - visibleEntries.length }}人）
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RankingProfileCard from '@/components/user-ranking/RankingProfileCard.vue'

/** 「もっと見る」を押すまでに表示する人数 */
const initialCount = 50

const props = defineProps({
  /** Rank 付きのランキングエントリ一覧 */
  entries: {
    type: Array,
    required: true,
  },
  /** 読み込み中かどうか */
  isLoading: {
    type: Boolean,
    default: false,
  },
  /** エラーメッセージ（空文字ならエラーなし） */
  errorMessage: {
    type: String,
    default: '',
  },
})

const showAll = ref(false)

const visibleEntries = computed(() =>
  showAll.value ? props.entries : props.entries.slice(0, initialCount),
)
const hasMore = computed(() => visibleEntries.value.length < props.entries.length)
</script>
