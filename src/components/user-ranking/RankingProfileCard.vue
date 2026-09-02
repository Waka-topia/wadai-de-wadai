<template>
  <v-divider />

  <v-card class="ranking-card pb-3" elevation="0">
    <div class="d-flex">
      <!-- 順位リボン。絶対配置にすると狭い画面でアイコンに重なるため、幅を持つ列として並べる -->
      <div class="rank-column">
        <v-img class="rank-ribbon" :src="ribbon" :alt="`${rank}位`" :width="ribbonWidth">
          <div class="rank-number font-weight-bold text-white text-center">
            {{ rank }}
          </div>
        </v-img>
      </div>

      <div class="d-flex align-center flex-grow-1 min-width-0 pt-4 pr-3">
        <v-avatar class="ranking-avatar mr-3">
          <v-img class="rounded-circle" :src="iconUrl" alt="ユーザーのアイコン" />
        </v-avatar>

        <div class="flex-grow-1 min-width-0">
          <p class="text-h5 font-weight-bold mb-1 text-truncate">{{ name }}</p>

          <div class="d-flex align-center mb-2">
            <v-icon color="red" size="x-large">mdi-stamper</v-icon>
            <span class="text-h6 text-red font-weight-bold ml-1">{{ count }}</span>
            <small class="text-red font-weight-bold ml-1">スタンプ</small>
          </div>

          <div class="d-flex align-center mb-1">
            <v-icon color="orange" size="x-small">mdi-triangle-down</v-icon>
            <small class="text-orange font-weight-bold ml-1">次回参加予定の団体</small>
          </div>

          <v-chip class="next-shinkan-chip font-weight-bold" color="orange">
            {{ status }}
          </v-chip>
        </div>
      </div>
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import ribbonGold from '@/assets/rankings/ribbon1.png'
import ribbonSilver from '@/assets/rankings/ribbon2.png'
import ribbonBronze from '@/assets/rankings/ribbon3.png'
import ribbonPlain from '@/assets/rankings/ribbon4.png'
import { resolveUserIcon } from '@/data/userIcons'

const props = defineProps({
  /** 順位（1始まり） */
  rank: {
    type: Number,
    required: true,
  },
  /** 表示名 */
  name: {
    type: String,
    required: true,
  },
  /** 獲得スタンプ数 */
  count: {
    type: Number,
    required: true,
  },
  /** 次回参加予定の団体（未登録なら null） */
  nextShinkan: {
    type: Object,
    default: null,
  },
  /** ユーザーアイコンのID（例: userIcon3） */
  iconId: {
    type: String,
    default: '',
  },
})

const ribbons = [ribbonGold, ribbonSilver, ribbonBronze]

/** 1〜3位は専用のリボン、4位以降は共通のリボンを使う */
const ribbon = computed(() => ribbons[props.rank - 1] ?? ribbonPlain)

/** 上位ほどリボンを大きく見せる */
const ribbonWidth = computed(() => (props.rank <= 3 ? 44 : 38))

const iconUrl = computed(() => resolveUserIcon(props.iconId))

/** 次回参加予定の団体。未登録の場合は当時と同じく「情報なし」と出す */
const status = computed(() =>
  props.nextShinkan?.groupName
    ? `${props.nextShinkan.groupName} - ${props.nextShinkan.nextDate || '日程未定'}`
    : '情報なし',
)
</script>

<style scoped>
.rank-column {
  /* リボンの幅ぶんを確保して、アイコンと重ならないようにする */
  flex: 0 0 auto;
  padding-left: 12px;
  padding-right: 8px;
}

.rank-ribbon {
  flex: 0 0 auto;
}

.ranking-avatar {
  /* 画面幅に応じて縮める。固定120pxだと狭い画面で本文を圧迫する */
  width: clamp(72px, 24vw, 120px);
  height: clamp(72px, 24vw, 120px);
}

.min-width-0 {
  min-width: 0;
}

.rank-number {
  /* リボンの布地部分に数字を載せる（先端の切り欠きにかからない位置） */
  padding-top: 2px;
  font-size: 1.25rem;
  line-height: 1.3;
}

.next-shinkan-chip {
  max-width: 100%;
  height: auto;
  min-height: 32px;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  padding: 6px 12px;
}
</style>
