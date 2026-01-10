<template>
  <v-col cols="12" md="6">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-icon color="grey">mdi-account-box-outline</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">ユーザーID</div>
          <div class="text-caption text-break">{{ props.userId }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
const props = defineProps({
  userId: {
    type: String,
    default: '',
    required: true,
  },
})
</script>
