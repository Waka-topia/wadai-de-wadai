<template>
  <!-- 検索バーの共通見た目。placeholder や @keyup.enter などはそのまま v-text-field に渡る -->
  <v-text-field
    v-model="query"
    class="search-field"
    variant="outlined"
    density="compact"
    rounded="pill"
    bg-color="grey-lighten-4"
    base-color="grey-darken-2"
    color="orange-darken-2"
    prepend-inner-icon="mdi-magnify"
    clear-icon="mdi-close"
    clearable
    hide-details
  />
</template>

<script setup>
// クリア（✕）時は null になる
const query = defineModel({ type: String, default: '' })
</script>

<style scoped>
.search-field :deep(.v-field__outline) {
  --v-field-border-width: 2px;
}
</style>
