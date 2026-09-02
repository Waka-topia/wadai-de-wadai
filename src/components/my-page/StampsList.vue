<template>
  <v-card elevation="0" rounded="lg" class="pa-4">
    <div class="d-flex align-center mb-3">
      <v-icon color="orange" class="mr-2">mdi-stamper</v-icon>
      <span class="text-body-1 font-weight-bold">スタンプコレクション</span>
    </div>

    <v-alert v-if="!isAuthenticated" type="warning" variant="tonal" density="comfortable">
      ログインして下さい
    </v-alert>

    <v-alert v-else-if="errorMessage" type="error" variant="tonal" density="comfortable">
      {{ errorMessage }}
    </v-alert>

    <v-skeleton-loader v-else-if="isLoading" type="image" />

    <template v-else>
      <!-- 進捗 -->
      <div class="mb-1 d-flex align-baseline justify-space-between">
        <span class="text-body-2 text-grey-darken-1">集めたスタンプ</span>
        <span class="text-body-2">
          <span class="text-h6 font-weight-bold text-orange">{{ ownedCount }}</span>
          / {{ totalCount }}
        </span>
      </div>
      <v-progress-linear
        :model-value="progressRatio"
        color="orange"
        bg-color="orange-lighten-4"
        height="8"
        rounded
        class="mb-3"
      />

      <!-- カテゴリ絞り込み -->
      <v-tabs v-model="selectedCategory" color="orange" density="compact" show-arrows class="mb-2">
        <v-tab v-for="tab in categoryTabs" :key="tab.value" :value="tab.value">
          {{ tab.label }}
        </v-tab>
      </v-tabs>

      <!-- グリッド -->
      <v-row dense>
        <v-col v-for="stamp in visibleStamps" :key="stamp.stampId" cols="4" sm="3" md="2">
          <div class="stamp-cell">
            <v-img
              :src="stamp.imageUrl"
              :alt="stamp.name"
              :class="{ 'stamp-image--locked': !stamp.isOwned }"
              aspect-ratio="1"
              cover
              loading="lazy"
            />
            <v-icon v-if="!stamp.isOwned" class="stamp-lock" color="grey-darken-1" size="20">
              mdi-lock
            </v-icon>
          </div>
          <p
            class="text-caption text-center mt-1 mb-0 stamp-name"
            :class="stamp.isOwned ? 'text-grey-darken-3' : 'text-grey-lighten-1'"
          >
            {{ stamp.name }}
          </p>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { stampCategoryLabels } from '@/data/stamps'

const props = defineProps({
  /** 全スタンプ（取得済みフラグ付き） */
  stamps: {
    type: Array,
    required: true,
  },
  /** 取得済みの数 */
  ownedCount: {
    type: Number,
    default: 0,
  },
  /** スタンプの総数 */
  totalCount: {
    type: Number,
    default: 0,
  },
  /** 進捗（パーセント） */
  progressRatio: {
    type: Number,
    default: 0,
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

const store = useStore()

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

const selectedCategory = ref('all')

const categoryTabs = computed(() => [
  { value: 'all', label: 'すべて' },
  ...Object.entries(stampCategoryLabels).map(([value, label]) => ({ value, label })),
])

const visibleStamps = computed(() =>
  selectedCategory.value === 'all'
    ? props.stamps
    : props.stamps.filter((stamp) => stamp.category === selectedCategory.value),
)
</script>

<style scoped>
.stamp-cell {
  position: relative;
  border: 1px solid rgb(var(--v-theme-surface-variant), 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.stamp-image--locked {
  filter: grayscale(1);
  opacity: 0.35;
}

.stamp-lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.stamp-name {
  line-height: 1.2;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
