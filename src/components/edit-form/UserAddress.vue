<template>
  <v-col cols="12" md="6">
    <v-card class="pa-3 elevation-1" outlined>
      <v-row align="center" justify="space-between">
        <v-col cols="auto">
          <v-icon color="grey">mdi-email</v-icon>
        </v-col>
        <v-col>
          <div class="text-subtitle-1 font-weight-medium">メールアドレス</div>
          <div class="text-body-1">{{ props.email }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
const props = defineProps({
  email: {
    type: String,
    default: '',
    required: true,
  },
})
</script>
