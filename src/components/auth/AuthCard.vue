<template>
  <v-container class="fill-height d-flex align-start justify-center pt-10" fluid>
    <v-card class="pa-6 pa-md-8 w-100" :max-width="maxWidth" rounded="xl" elevation="1">
      <v-progress-linear
        v-if="loading"
        color="orange-darken-2"
        indeterminate
        absolute
        top
      ></v-progress-linear>

      <div class="text-center mb-8">
        <v-avatar color="orange-lighten-5" size="72" class="mb-4">
          <v-icon size="36" color="orange-darken-2">{{ icon }}</v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold text-grey-darken-3">{{ title }}</h2>
        <!-- 改行などを含む説明は subtitle スロットで渡す -->
        <slot name="subtitle">
          <p v-if="subtitle" class="text-caption text-grey-darken-1 mt-1">{{ subtitle }}</p>
        </slot>
      </div>

      <slot />
    </v-card>
  </v-container>
</template>

<script setup>
defineProps({
  // ヘッダーのアバターに表示する mdi アイコン名
  icon: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  maxWidth: { type: [String, Number], default: 450 },
  // カード上端にローディングバーを表示するか
  loading: { type: Boolean, default: false },
})
</script>
