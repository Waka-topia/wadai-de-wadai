<template>
  <v-list-item class="ranking-row" :class="{ 'bg-orange-lighten-5': isMe }" rounded="lg">
    <template #prepend>
      <div class="rank-badge text-center mr-3">
        <span class="text-body-2 font-weight-bold text-grey-darken-2">{{ entry.rank }}</span>
      </div>
      <v-avatar size="40">
        <v-img :src="defaultIcon" alt="ユーザーアイコン" />
      </v-avatar>
    </template>

    <v-list-item-title class="text-body-2 font-weight-bold">
      {{ entry.displayName }}
      <v-chip v-if="isMe" color="orange" size="x-small" variant="flat" class="ml-1 text-white">
        あなた
      </v-chip>
    </v-list-item-title>

    <template #append>
      <v-icon color="red" size="18">mdi-stamper</v-icon>
      <span class="text-red font-weight-bold ml-1">{{ entry.stampCount }}</span>
    </template>
  </v-list-item>
</template>

<script setup>
import defaultIcon from '@/assets/userIcon/defaultIcon.png'

defineProps({
  /** ランキングエントリ（rank / displayName / stampCount） */
  entry: {
    type: Object,
    required: true,
  },
  /** ログイン中のユーザー本人の行か */
  isMe: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
.rank-badge {
  min-width: 28px;
}
</style>
