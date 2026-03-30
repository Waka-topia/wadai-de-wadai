<template>
  <v-col cols="12" md="6">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-icon color="grey">mdi-account-circle</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">ユーザー名</div>
          <div class="text-body-1">{{ props.displayName }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
const props = defineProps({
  displayName: {
    type: String,
    required: true,
  },
})
</script>
