<template>
  <div>
    <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable">
      {{ errorMessage }}
    </v-alert>

    <template v-else-if="isLoading">
      <v-skeleton-loader v-for="n in 7" :key="n" type="list-item-avatar-two-line" />
    </template>

    <v-alert v-else-if="entries.length === 0" type="info" variant="tonal" density="comfortable">
      まだランキングデータがありません。
    </v-alert>

    <template v-else>
      <RankingPodium :entries="podiumEntries" />

      <v-list v-if="restEntries.length > 0" class="py-0 bg-transparent" lines="one">
        <RankingRow
          v-for="entry in visibleRestEntries"
          :key="entry.userId"
          :entry="entry"
          :is-me="entry.userId === currentUserId"
        />
      </v-list>

      <div v-if="hasMore" class="text-center mt-3">
        <v-btn variant="tonal" color="orange" rounded="pill" @click="showAll = true">
          もっと見る（残り{{ restEntries.length - visibleRestEntries.length }}人）
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import RankingPodium from '@/components/user-ranking/RankingPodium.vue'
import RankingRow from '@/components/user-ranking/RankingRow.vue'

/** 「もっと見る」を押すまでに表彰台の下へ表示する人数 */
const initialRestCount = 47

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
  /** ログイン中のユーザーID（自分の行をハイライトする） */
  currentUserId: {
    type: String,
    default: '',
  },
})

const showAll = ref(false)

const podiumEntries = computed(() => props.entries.slice(0, 3))
const restEntries = computed(() => props.entries.slice(3))
const visibleRestEntries = computed(() =>
  showAll.value ? restEntries.value : restEntries.value.slice(0, initialRestCount),
)
const hasMore = computed(() => visibleRestEntries.value.length < restEntries.value.length)
</script>
