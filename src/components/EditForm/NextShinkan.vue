<template>
  <div>
    <!-- 第一段階: カテゴリー選択 -->
    <div class="d-flex flex-column my-3">
      <label for="main-category" class="font-weight-bold">カテゴリーで絞り込み:</label>
      <select v-model="selectedMainCategory" @change="filterGroups">
        <option value="all">すべて</option>
        <option value="club">部活</option>
        <option value="circle">サークル</option>
        <option value="committee">その他(委員会)</option>
      </select>
    </div>

    <!-- 第二段階: 運動系/文化系の選択 -->
    <div v-if="selectedMainCategory !== 'all'" class="d-flex flex-column my-3">
      <label for="sub-category" class="font-weight-bold">運動系または文化系:</label>
      <select v-model="selectedSubCategory" @change="filterGroups">
        <option value="all">すべて</option>
        <option value="sports">運動系</option>
        <option value="culture">文化系</option>
      </select>
    </div>

    <!-- 団体選択 -->
    <div class="d-flex flex-column my-3">
      <label for="group" class="font-weight-bold">団体を選択:</label>
      <select v-model="selectedGroup">
        <option v-for="group in filteredGroups" :key="group.id" :value="group.name">
          {{ group.name }}
        </option>
      </select>
    </div>

    <!-- 日付選択 -->
    <div class="d-flex flex-column my-3">
      <label for="date" class="font-weight-bold">日付を選択:</label>
      <input type="date" v-model="selectedDate" />
    </div>

    <!-- 保存ボタン -->
    <div class="d-flex flex-column my-3 mt-5">
      <v-btn size="large" color="success" @click="saveShinkan">保存</v-btn>
    </div>

    <!-- スナックバー通知 -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { allGroups } from '@/data/groups'
import { computed, onMounted, ref } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// リアクティブな状態の定義
const selectedMainCategory = ref('all')
const selectedSubCategory = ref('all')
const selectedGroup = ref('')
const selectedDate = ref('')
const filteredGroups = ref([])
const isLoading = ref(false)
const snackbar = ref({
  show: false,
  color: '',
  message: ''
})

// Vuexのステート参照
const userId = computed(() => store.state.auth.userId)

// メソッドの定義
const filterGroups = () => {
  let groups =
    selectedMainCategory.value === 'all'
      ? allGroups
      : allGroups.filter((group) => group.mainCategory === selectedMainCategory.value)

  if (selectedSubCategory.value !== 'all') {
    groups = groups.filter((group) => group.subCategory === selectedSubCategory.value)
  }

  filteredGroups.value = groups
}

const saveShinkan = async () => {
  try {
    isLoading.value = true
    await store.dispatch('shinkan/saveNextShinkan', {
      userId: userId.value,
      groupName: selectedGroup.value,
      nextDate: selectedDate.value,
    })
    snackbar.value = {
      show: true,
      color: 'success',
      message: '保存が完了しました'
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      color: 'error',
      message: '保存に失敗しました: ' + error.message
    }
  } finally {
    isLoading.value = false
  }
}

// コンポーネントマウント時の処理
onMounted(() => {
  filterGroups()
})
</script>

<style scoped>
select,
input[type='date'] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}
</style>
