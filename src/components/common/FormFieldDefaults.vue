<template>
  <!-- 中の入力欄に、グレー背景・outlined の共通スタイルを適用する -->
  <v-defaults-provider :defaults="fieldDefaults">
    <div class="form-field-defaults">
      <slot />
    </div>
  </v-defaults-provider>
</template>

<script setup>
const fieldStyle = {
  variant: 'outlined',
  density: 'comfortable',
  bgColor: 'grey-lighten-4',
  baseColor: 'grey-darken-2',
}

const fieldDefaults = {
  VTextField: fieldStyle,
  VTextarea: fieldStyle,
  VSelect: fieldStyle,
  VAutocomplete: fieldStyle,
}
</script>

<style scoped>
.form-field-defaults :deep(.v-field--variant-outlined .v-field__outline) {
  --v-field-border-width: 2px;
}

.form-field-defaults :deep(.v-field:not(.v-field--focused) .v-label) {
  color: #616161;
  opacity: 1;
}
</style>
