<template>
  <div>
    <v-skeleton-loader v-if="isLoading" type="image" :elevation="1" />
    <v-alert
      v-else-if="!isAuthenticated"
      type="warning"
      title="warning"
      text="ログインして下さい"
    ></v-alert>
    <v-alert
      v-else-if="stampImages.length === 0"
      type="info"
      title="info"
      text="スタンプをまだ持っていません。"
    ></v-alert>
    <v-alert v-else-if="isErrored" type="error" title="エラー" :text="errorMessages"></v-alert>
    <v-row v-else class="mt-1 mx-1">
      <v-col v-for="stamp in stampImages" :key="stamp.stampId" cols="6" md="3" sm="4">
        <v-card class="border-md" aspect-ratio="1" elevation="0">
          <v-img :alt="stamp.name" :src="`/src/assets/${stamp.imageUrl}`" aspect-ratio="1"></v-img>
          <v-card-title class="font-weight-bold text-body-2 text-center"
            ><small>{{ stamp.name }}</small></v-card-title
          >
          <!-- <v-card-text>{{ stamp.description }}</v-card-text> -->
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

const isLoading = ref(true) // 初期は読み込み中
const isErrored = ref(false)
const errorMessages = ref('画像の取得に失敗しました')

const userStampImages = computed(() => store.getters['stamps/userStampImages'])
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])

const stampImages = computed(() => {
  return userStampImages.value || []
})

const fetchUserStampImages = () => store.dispatch('stamps/fetchUserStampImages')

const loadStampImages = async () => {
  try {
    await fetchUserStampImages()
  } catch (error) {
    isErrored.value = true
    errorMessages.value = error.message || error
  } finally {
    isLoading.value = false
  }
}

watch(
  isAuthenticated,
  (newVal) => {
    if (newVal) {
      loadStampImages()
    }
  },
  { immediate: true },
)

if (isAuthenticated.value) {
  loadStampImages()
} else {
  isLoading.value = false // 認証が必要な場合も読み込み終了
}
</script>
