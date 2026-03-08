<template>
  <div class="timetable-page">
    <header class="page-header">
      <h1>時間割</h1>
    </header>

    <main class="page-content">
      <TimetableGrid @cell-click="handleCellClick" />
    </main>

    <!-- 講義登録・編集モーダル -->
    <LectureEditorModal
      v-model="showModal"
      :selected-cell="selectedCell"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TimetableGrid from '@/components/timetable/TimetableGrid.vue'
import LectureEditorModal from '@/components/timetable/LectureEditorModal.vue'

const showModal = ref(false)
const selectedCell = ref(null)

const handleCellClick = ({ day, period }) => {
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
