<template>
  <div class="profile-image">
    <div class="text-center pa-4">
      <v-btn @click="dialog = true" icon="mdi-pencil">
      </v-btn>

      <v-bottom-sheet v-model="dialog" width="auto">
        <v-card prepend-icon="mdi-pencil" title="アイコンを変更" class="font-weight-bold">
          <template v-slot:actions>
            <v-container>
              <v-row>
                <v-col v-for="(icon, index) in icons" :key="index" sm="4" md="3" lg="2" xl="1" class="d-flex justify-center">
                  <v-img :src="getImageUrl(`userIcon/userIcon${index + 1}.png`)" :alt="'アイコン' + (index + 1)"
                    :width="100" :height="100" max-width="100" max-height="100" cover aspect-ratio="1/1" :class="{ 'selected': selectedIcon === index }"
                    @click="selectIcon(index)" contain>
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
import { computed, ref } from 'vue'
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
  message: ''
})

// computedプロパティ
const photoURL = computed(() => store.getters['auth/photoURL'])

// メソッド
const selectIcon = (index) => {
  selectedIcon.value = index
  saveIcon()
}

const saveIcon = async () => {
  try {
    if (selectedIcon.value !== null) {
      isLoading.value = true
      const iconURL = `userIcon/userIcon${selectedIcon.value + 1}.png`
      await store.dispatch('auth/updatePhotoURL', iconURL)
      snackbar.value = {
        show: true,
        color: 'success',
        message: 'アイコンを保存しました'
      }
      dialog.value = false
    } else {
      snackbar.value = {
        show: true,
        color: 'error',
        message: 'アイコンを選択してください'
      }
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: 'アイコンの保存に失敗しました: ' + error.message
    }
  } finally {
    isLoading.value = false
  }
}

const getImageUrl = (relativePath) => {
  return new URL(`../../assets/${relativePath}`, import.meta.url).href
}
</script>
