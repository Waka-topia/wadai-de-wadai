<template>
  <div class="profile-image">
    <div class="text-center pa-4">
      <v-btn icon="mdi-pencil" @click="dialog = true"> </v-btn>

      <v-bottom-sheet v-model="dialog" width="auto">
        <v-card class="font-weight-bold" title="アイコンを変更" prepend-icon="mdi-pencil">
          <template #actions>
            <v-container>
              <v-row>
                <v-col
                  class="d-flex justify-center"
                  v-for="(icon, index) in icons"
                  :key="index"
                  lg="2"
                  md="3"
                  sm="4"
                  xl="1"
                >
                  <v-img
                    :alt="'アイコン' + (index + 1)"
                    :class="{ selected: selectedIcon === index }"
                    :height="100"
                    :src="getImageUrl(`userIcon/userIcon${index + 1}.png`)"
                    :width="100"
                    aspect-ratio="1/1"
                    contain
                    cover
                    max-height="100"
                    max-width="100"
                    @click="selectIcon(index)"
                  >
                  </v-img>
                </v-col>
              </v-row>
            </v-container>
          </template>
        </v-card>
      </v-bottom-sheet>
    </div>

    <!-- スナックバー通知 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// リアクティブな状態の定義
const dialog = ref(false)
const selectedIcon = ref(null)
const icons = Array.from({ length: 8 }, (_, index) => `userIcon${index + 1}`)
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: '',
})

// computedプロパティ

// メソッド
const selectIcon = (index) => {
  selectedIcon.value = index
  saveIcon()
}

const saveIcon = async () => {
  try {
    if (selectedIcon.value !== null) {
      isLoading.value = true
      const iconUrl = `userIcon/userIcon${selectedIcon.value + 1}.png`
      await store.dispatch('auth/updatePhotoURL', iconUrl)
      snackbar.value = {
        show: true,
        color: 'success',
        message: 'アイコンを保存しました',
      }
      dialog.value = false
    } else {
      snackbar.value = {
        show: true,
        color: 'error',
        message: 'アイコンを選択してください',
      }
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'アイコンの保存に失敗しました: ' + error.message,
    }
  } finally {
    isLoading.value = false
  }
}

const getImageUrl = (relativePath) => {
  return new URL(`../../assets/${relativePath}`, import.meta.url).href
}
</script>
