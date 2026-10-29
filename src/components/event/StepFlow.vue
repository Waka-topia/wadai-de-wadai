<template>
  <!-- 縦並び: 番号と説明文のリスト -->
  <div v-if="vertical" class="d-flex flex-column ga-3">
    <div v-for="(step, index) in steps" :key="step.label" class="d-flex align-center ga-3">
      <v-avatar :color="step.color || 'orange-darken-2'" size="28" class="flex-shrink-0">
        <span class="text-caption font-weight-bold text-white">{{ index + 1 }}</span>
      </v-avatar>
      <p class="text-body-2 mb-0">{{ step.label }}</p>
    </div>
  </div>

  <!-- 横並び: ステップ → ステップ → … -->
  <div v-else class="d-flex align-center justify-center ga-2 flex-nowrap">
    <template v-for="(step, index) in steps" :key="step.label">
      <v-icon v-if="index > 0" size="16" color="grey-lighten-1">mdi-chevron-right</v-icon>
      <div class="step-item">
        <v-icon v-if="step.icon" size="20" :color="step.color" class="mb-1">{{ step.icon }}</v-icon>
        <v-avatar v-else :color="step.color" size="22" class="mb-1">
          <span class="step-num font-weight-bold text-white">{{ index + 1 }}</span>
        </v-avatar>
        <p class="step-label font-weight-bold mb-0">{{ step.label }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  // 各ステップ。icon を省略すると番号を表示する
  steps: {
    type: Array,
    required: true,
    validator: (steps) => steps.every((step) => typeof step.label === 'string'),
  },
  // 番号と説明文の縦並びで表示するか
  vertical: { type: Boolean, default: false },
})
</script>

<style scoped>
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-label {
  font-size: 11px;
  white-space: nowrap;
}

.step-num {
  font-size: 10px;
}
</style>
