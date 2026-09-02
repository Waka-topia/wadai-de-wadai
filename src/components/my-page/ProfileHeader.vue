<template>
  <v-card class="py-6 text-center" elevation="1" rounded="lg">
    <v-avatar class="mb-3" size="140">
      <v-img class="rounded-circle" :src="user.userIconUrl" alt="ユーザーのアイコン" />
    </v-avatar>

    <div class="font-weight-bold text-h4 px-4 mb-4 text-truncate">
      {{ user.userName }}
    </div>

    <ProfileEditSheet />
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import ProfileEditSheet from '@/components/my-page/ProfileEditSheet.vue'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
