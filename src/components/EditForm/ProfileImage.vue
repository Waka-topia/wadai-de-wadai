<template>
  <div class="profile-image">
    <v-btn color="green" v-if="!isEditing" @click="startEditing">アイコンを変更</v-btn>

    <!-- アイコン選択フォーム（編集モード時のみ表示） -->
    <div v-if="isEditing">
      <div class="icons">
        <img v-for="(icon, index) in icons" :key="index" :src="getImageUrl(`userIcon/userIcon${index + 1}.png`)"
          alt="アイコン" :class="{ 'selected': selectedIcon === index }" @click="selectIcon(index)" />
      </div>

      <p v-if="selectedIcon !== null">選択されたアイコン: {{ selectedIcon + 1 }}</p>

      <v-btn color="green" @click="saveIcon">アイコンを保存</v-btn>
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
const selectedIcon = ref(null)
const isEditing = ref(false)
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
      isEditing.value = false
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

const startEditing = () => {
  isEditing.value = true
}

const getImageUrl = (relativePath) => {
  return new URL(`../../assets/${relativePath}`, import.meta.url).href
}
</script>

<style scoped>
.profile-image {
  text-align: center;
}

.icons {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.icons img {
  width: 50px;
  height: 50px;
  cursor: pointer;
  border-radius: 50%;
}

.icons img.selected {
  border: 3px solid blue;
}
</style>
