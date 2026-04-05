<template>
  <v-card class="mt-2" elevation="0" hover outlined>
    <!-- アバター部分 -->
    <v-row>
      <v-avatar class="mx-auto mt-7 mb-3" size="140">
        <v-img class="rounded-circle" alt="ユーザーのアイコン" :src="user.userIconUrl"></v-img>
      </v-avatar>
    </v-row>

    <!-- ユーザー名 -->
    <v-row class="my-3">
      <span class="font-weight-bold text-h4 mx-auto text-truncate">
        {{ user.userName }}
      </span>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const user = computed(() => store.getters['users/currentUserData'])
</script>
