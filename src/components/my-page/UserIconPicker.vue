<template>
  <div class="text-center">
    <v-avatar class="icon-preview" size="120">
      <v-img :src="resolveUserIcon(selectedId)" alt="選択中のアイコン" />
    </v-avatar>

    <div class="mt-2">
      <v-btn prepend-icon="mdi-pencil" size="small" variant="tonal" @click="isOpen = true">
        アイコンを変更
      </v-btn>
    </div>

    <v-bottom-sheet v-model="isOpen">
      <v-card prepend-icon="mdi-pencil" title="アイコンを変更">
        <v-card-text>
          <v-row dense>
            <v-col
              v-for="icon in userIcons"
              :key="icon.id"
              class="d-flex justify-center"
              cols="3"
              sm="2"
            >
              <v-avatar
                class="icon-option"
                :class="{ 'icon-option--selected': selectedId === icon.id }"
                size="72"
                @click="onSelect(icon.id)"
              >
                <v-img :src="icon.src" :alt="icon.id" />
              </v-avatar>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { resolveUserIcon, userIcons } from '@/data/userIcons'

const selectedId = defineModel({ type: String, default: '' })

const isOpen = ref(false)

/**
 * アイコンを選んでシートを閉じる
 *
 * @param {string} iconId - 選択したアイコンID
 */
const onSelect = (iconId) => {
  selectedId.value = iconId
  isOpen.value = false
}
</script>

<style scoped>
.icon-preview {
  border: 2px solid rgb(var(--v-theme-surface-variant));
}

.icon-option {
  cursor: pointer;
  border: 3px solid transparent;
  transition: border-color 0.2s;
}

.icon-option--selected {
  border-color: #ff9800;
}
</style>
