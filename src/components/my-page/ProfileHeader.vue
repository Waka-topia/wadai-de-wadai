<template>
  <v-card class="py-6 text-center" elevation="1" rounded="lg">
    <v-avatar class="mb-3" size="140">
      <v-img class="rounded-circle" :src="user.userIconUrl" alt="ユーザーのアイコン" />
    </v-avatar>

    <div class="font-weight-bold text-h4 px-4 text-truncate">
      {{ user.userName }}
    </div>

    <div class="d-flex align-center justify-center mt-2 mb-4">
      <v-icon color="red" size="x-large">mdi-stamper</v-icon>
      <span class="text-h5 text-red font-weight-bold ml-1">{{ stampCount }}</span>
      <small class="text-red font-weight-bold ml-1">スタンプ</small>
    </div>

    <ProfileEditDialog />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ProfileEditDialog from '@/components/my-page/ProfileEditDialog.vue'

defineProps({
  /** 獲得したスタンプ数 */
  stampCount: {
    type: Number,
    default: 0,
  },
})

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
