<template>
  <v-card class="h-100 overflow-hidden" elevation="0" rounded="lg">
    <v-row align="center" no-gutters class="pa-4">
      <v-col cols="auto" class="mr-4">
        <v-avatar color="blue-grey-lighten-5" rounded="lg">
          <v-icon color="blue-grey-darken-2">{{ icon }}</v-icon>
        </v-avatar>
      </v-col>
      <v-col style="min-width: 0">
        <div class="text-caption text-grey-darken-1 font-weight-bold mb-1">{{ label }}</div>
        <!-- チップなど文字列以外を表示するときはスロットで渡す -->
        <slot>
          <div class="text-body-2 font-weight-medium text-truncate">{{ value }}</div>
        </slot>
      </v-col>
    </v-row>

    <!-- カード下部の補足や導線 -->
    <template v-if="$slots.footer">
      <v-divider />
      <slot name="footer" />
    </template>
  </v-card>
</template>

<script setup>
defineProps({
  // mdi アイコン名
  icon: { type: String, required: true },
  label: { type: String, required: true },
  value: { type: String, default: '' },
})
</script>
