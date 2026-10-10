<template>
  <v-expansion-panels v-model="openPanel">
    <v-expansion-panel :value="panelValue" elevation="1" rounded="lg">
      <v-expansion-panel-title class="font-weight-bold text-subtitle-1">
        <v-icon class="mr-3" color="grey-darken-1">{{ icon }}</v-icon>
        {{ title }}
      </v-expansion-panel-title>

      <v-expansion-panel-text :class="contentClass">
        <slot />
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  // 見出しの左に表示する mdi アイコン名
  icon: { type: String, required: true },
  title: { type: String, required: true },
  // 開いた中身の領域に付けるクラス（背景色など）
  contentClass: { type: [String, Array, Object], default: '' },
})

// パネルが開いているか（開閉に合わせて処理したい場合に v-model で受け取る）
const isOpen = defineModel({ type: Boolean, default: false })

const panelValue = 'content'

const openPanel = computed({
  get: () => (isOpen.value ? panelValue : null),
  set: (value) => {
    isOpen.value = value === panelValue
  },
})
</script>
