<template>
  <v-card class="mt-2" elevation="0" hover outlined>
    <!-- アバター部分 -->
    <v-row>
      <v-avatar class="mx-auto mt-7 mb-3" size="140">
        <v-img
          class="rounded-circle"
          alt="ユーザーのアイコン"
          :src="props.photoUrlResolved"
        ></v-img>
      </v-avatar>
    </v-row>

    <!-- ユーザー名 -->
    <v-row class="mb-3">
      <span class="font-weight-bold text-h4 mx-auto text-truncate">{{ props.name }}</span>
    </v-row>

    <!-- スタンプとアイコン情報 -->
    <v-row class="my-2" align="center" justify="center">
      <!-- スタンプ情報 -->
      <v-col class="pa-0" cols="12" sm="5">
        <div class="d-flex align-center justify-end">
          <v-icon class="mr-2" color="red" size="x-large">mdi-stamper</v-icon>
          <div class="stats-text">
            <span class="text-h6 text-red font-weight-bold">{{ props.count }}</span>
            <span class="text-subtitle-2 text-red font-weight-bold">スタンプ</span>
          </div>
        </div>
      </v-col>

      <!-- 区切り線 -->
      <v-col class="px-3" cols="auto">
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
const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
  },
  photoUrlResolved: {
    type: String,
    default: '',
    required: false,
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
