<template>
  <div v-if="isAuthenticated" class="ranking-page pa-4">
    <RankingList
      :entries="entries"
      :is-loading="isLoading"
      :error-message="errorMessage"
      :current-user-id="userId || ''"
    />

    <!-- 自分の順位を常時表示 -->
    <v-card
      v-if="myStampCount !== null"
      class="my-rank-bar"
      color="orange"
      rounded="pill"
      elevation="6"
    >
      <div class="d-flex align-center justify-space-between px-4 py-2 text-white">
        <span class="text-body-2 font-weight-bold">あなたの順位</span>
        <span class="text-body-2 d-flex align-center">
          <template v-if="myRank">
            <span class="text-h6 font-weight-bold">{{ myRank }}</span>
            <span class="ml-1">位</span>
          </template>
          <template v-else>ランキング圏外</template>
          <v-icon size="16" class="ml-3">mdi-stamper</v-icon>
          <span class="font-weight-bold ml-1">{{ myStampCount }}</span>
        </span>
      </div>
    </v-card>
  </div>

  <div v-else>
    <RecommendLogin />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useStore } from 'vuex'
import RecommendLogin from '@/components/templates/RecommendLogin.vue'
import RankingList from '@/components/user-ranking/RankingList.vue'
import { useFirebasePageView } from '@/composables/useFirebasePageView'
import { useTopRanking } from '@/composables/useTopRanking'
import { fetchMyRankingEntry } from '@/services/rankingService'

const store = useStore()

useFirebasePageView('view_ranking', () => ({
  authenticated: store.getters['auth/isAuthenticated'],
}))

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const userId = computed(() => store.getters['auth/userId'])

const { entries, isLoading, errorMessage } = useTopRanking()

// トップ100圏外のユーザー向けに、自分のスタンプ数だけ別途取得しておく
const myEntry = ref(null)

watch(
  userId,
  async (nextUserId) => {
    if (!nextUserId) {
      myEntry.value = null
      return
    }

    try {
      myEntry.value = await fetchMyRankingEntry(nextUserId)
    } catch {
      // 自分の順位は補助表示なので、取得できなくても一覧の表示は妨げない
      myEntry.value = null
    }
  },
  { immediate: true },
)

/** ランキング一覧に自分がいれば、その順位（圏外なら null） */
const myRank = computed(
  () => entries.value.find((entry) => entry.userId === userId.value)?.rank ?? null,
)

/** 自分のスタンプ数。一覧に載っていれば一覧の値を優先する（リアルタイムに追随するため） */
const myStampCount = computed(() => {
  const listed = entries.value.find((entry) => entry.userId === userId.value)
  if (listed) return listed.stampCount
  return myEntry.value?.stampCount ?? null
})
</script>

<style scoped>
.ranking-page {
  /* 下部の順位バーとボトムナビに隠れないよう余白を確保する */
  padding-bottom: calc(env(safe-area-inset-bottom) + 140px) !important;
}

.my-rank-bar {
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(env(safe-area-inset-bottom) + 76px);
  z-index: 4;
}
</style>
