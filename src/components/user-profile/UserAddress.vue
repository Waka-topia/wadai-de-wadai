<template>
  <v-col cols="12" md="6">
    <v-card class="pa-4 h-100" elevation="0" rounded="lg">
      <v-row align="center" no-gutters>
        <v-col cols="auto" class="mr-4">
          <v-avatar color="blue-grey-lighten-5" rounded="lg">
            <v-icon color="blue-grey-darken-2">mdi-email</v-icon>
          </v-avatar>
        </v-col>
        <v-col style="min-width: 0">
          <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">メールアドレス</div>
          <div class="text-body-2 font-weight-medium text-truncate">{{ props.email }}</div>
        </v-col>
      </v-row>
    </v-card>
  </v-col>
</template>

<script setup>
const props = defineProps({
  email: {
    type: String,
    required: true,
  },
})
</script>
