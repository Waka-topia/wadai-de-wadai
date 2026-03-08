<template>
  <div class="timetable-page">
    <header class="page-header">
      <h1>時間割</h1>
    </header>

    <main class="page-content">
      <TimetableGrid @cell-click="handleCellClick" />
    </main>

    <!-- 講義登録・編集モーダル -->
    <LectureEditorModal v-model="showModal" :selected-cell="selectedCell" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import TimetableGrid from '@/components/timetable/TimetableGrid.vue'
import LectureEditorModal from '@/components/timetable/LectureEditorModal.vue'

const store = useStore()
const router = useRouter()
const showModal = ref(false)
const selectedCell = ref(null)

const userId = computed(() => store.getters['auth/userId'])

// 認証状態が確定したタイミング、またはページ表示時にデータを取得
watch(
  userId,
  (newId) => {
    if (newId) {
      store.dispatch('timetable/fetchTimetable')
    }
  },
  { immediate: true },
)

const handleCellClick = ({ day, period }) => {
  // 未ログインの場合はログインページへ
  if (!store.getters['auth/isAuthenticated']) {
    router.push('/login')
    return
  }
  selectedCell.value = { day, period }
  showModal.value = true
}
</script>

<style scoped>
.timetable-page {
  padding: 1rem;
  padding-bottom: 80px;
}

.page-header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}
</style>
