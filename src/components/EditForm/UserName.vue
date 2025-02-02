<template>
  <v-col cols="12" md="6">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-icon color="primary">mdi-account-circle</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">ユーザー名</div>
          <div class="text-body-1">{{ displayName }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const displayName = computed(() => store.getters["auth/displayName"] || "Unknown");
</script>
