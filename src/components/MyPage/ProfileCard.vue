<template>
  <v-card class="mt-2" outlined hover elevation="0">
    <!-- アバター部分 -->
    <v-row>
      <v-avatar size="140" class="mx-auto mt-7 mb-3">
        <v-img :src="image" alt="ユーザーのアイコン" class="rounded-circle"></v-img>
      </v-avatar>
    </v-row>

    <!-- ユーザー名 -->
    <v-row class="mb-3">
      <span class="font-weight-bold text-h4 mx-auto text-truncate">{{ name }}</span>
    </v-row>

    <!-- スタンプとアイコン情報 -->
    <v-row justify="center" align="center" class="my-2">
      <!-- スタンプ情報 -->
      <v-col cols="12" sm="5" class="pa-0">
        <div class="d-flex align-center justify-end">
          <v-icon size="x-large" color="red" class="mr-2">mdi-stamper</v-icon>
          <div class="stats-text">
            <span class="text-h6 text-red font-weight-bold">{{ count }}</span>
            <span class="text-subtitle-2 text-red font-weight-bold">スタンプ</span>
          </div>
        </div>
      </v-col>

      <!-- 区切り線 -->
      <v-col cols="auto" class="px-3">
        <v-divider vertical></v-divider>
      </v-col>

      <!-- アイコン情報 -->
      <!-- <v-col cols="12" sm="5" class="pa-0">
        <div class="d-flex align-center justify-start">
          <v-icon size="x-large" color="orange" class="mr-2">mdi-webcam</v-icon>
          <div class="stats-text">
            <span class="text-h6 text-orange font-weight-bold">0</span>
            <span class="text-subtitle-2 text-orange font-weight-bold">個</span>
          </div>
        </div>
      </v-col> -->
    </v-row>

    <v-spacer class="my-2"></v-spacer>
  </v-card>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
})
</script>

<style scoped>
.stats-text {
  display: flex;
  align-items: baseline;
}

.stats-text .text-subtitle-2 {
  margin-left: 4px;
}

/* モバイル対応 */
@media (max-width: 600px) {
  .v-row.justify-center {
    flex-direction: column;
  }

  .v-divider.vertical {
    display: none;
  }

  .v-col {
    margin-bottom: 8px;
  }

  .d-flex.align-center.justify-end,
  .d-flex.align-center.justify-start {
    justify-content: center !important;
  }
}
</style>
