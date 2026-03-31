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
  </v-card>
</template>

<script setup>
const props = defineProps({
  name: {
    type: String,
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
