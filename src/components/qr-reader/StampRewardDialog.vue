<template>
  <v-dialog v-model="isOpen" max-width="360" persistent>
    <v-card rounded="lg" class="text-center pa-2">
      <v-card-text class="pb-2">
        <p class="text-overline mb-1" :class="granted ? 'text-orange' : 'text-grey-darken-1'">
          {{ granted ? 'スタンプをゲット！' : '取得済みのスタンプ' }}
        </p>

        <v-img
          v-if="stamp"
          :src="stamp.imageUrl"
          :alt="stamp.name"
          class="reward-image mx-auto my-3"
          :class="{ 'reward-image--owned': !granted }"
          aspect-ratio="1"
          width="180"
        />

        <p class="text-body-1 font-weight-bold mb-1">{{ stamp?.name ?? 'スタンプ' }}</p>

        <p v-if="granted" class="text-body-2 text-grey-darken-1 mb-0">
          <span class="text-h6 font-weight-bold text-orange">{{ ownedCount }}</span>
          / {{ totalCount }} 個目
        </p>
        <p v-else class="text-body-2 text-grey-darken-1 mb-0">このスタンプはすでに持っています</p>
      </v-card-text>

      <v-card-actions class="flex-column ga-2 pa-4 pt-2">
        <v-btn
          color="orange"
          variant="flat"
          block
          rounded="pill"
          class="text-white font-weight-bold"
          @click="onContinue"
        >
          続けて読み取る
        </v-btn>
        <v-btn to="/mypage" color="orange" variant="text" block rounded="pill" class="ms-0">
          コレクションを見る
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
defineProps({
  /** スタンプを新規に獲得したか（false は取得済み） */
  granted: {
    type: Boolean,
    default: true,
  },
  /** 表示するスタンプ（stampId / name / imageUrl） */
  stamp: {
    type: Object,
    default: null,
  },
  /** 獲得済みのスタンプ数 */
  ownedCount: {
    type: Number,
    default: 0,
  },
  /** スタンプの総数 */
  totalCount: {
    type: Number,
    default: 0,
  },
})

const isOpen = defineModel({ type: Boolean, default: false })

const onContinue = () => {
  isOpen.value = false
}
</script>

<style scoped>
.reward-image--owned {
  filter: grayscale(0.6);
  opacity: 0.6;
}
</style>
