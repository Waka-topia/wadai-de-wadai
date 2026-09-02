<template>
  <div>
    <p class="text-caption font-weight-bold text-grey-darken-1 mb-2">アイコン</p>

    <v-row dense>
      <v-col v-for="icon in userIcons" :key="icon.id" class="d-flex justify-center" cols="3">
        <v-avatar
          class="icon-option"
          :class="{ 'icon-option--selected': selectedId === icon.id }"
          size="64"
          @click="selectedId = icon.id"
        >
          <v-img :src="icon.src" :alt="icon.id" />
        </v-avatar>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { userIcons } from '@/data/userIcons'

const selectedId = defineModel({ type: String, default: '' })
</script>

<style scoped>
.icon-option {
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s;
}

.icon-option--selected {
  border-color: #ff9800;
}
</style>
