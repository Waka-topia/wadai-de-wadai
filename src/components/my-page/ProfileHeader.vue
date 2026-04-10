<template>
  <v-card class="py-6 text-center" elevation="0.5" rounded="lg">
    <v-avatar class="mb-3" size="140">
      <v-img class="rounded-circle" alt="ユーザーのアイコン" :src="user.userIconUrl"></v-img>
    </v-avatar>
    <div class="font-weight-bold text-h4 px-4 text-truncate">
      {{ user.userName }}
    </div>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const user = computed(() => store.getters['users/currentUserData'])
</script>
