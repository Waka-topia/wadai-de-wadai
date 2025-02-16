<template>
  <v-col cols="12" md="6">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-icon color="grey">mdi-email</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">メールアドレス</div>
          <div class="text-body-1">{{ email }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const email = computed(() => store.getters["auth/email"] || "Unknown");
</script>
