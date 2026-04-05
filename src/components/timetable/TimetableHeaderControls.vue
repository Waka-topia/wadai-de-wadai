<template>
  <div>
    <div class="grade-selector">
      <button
        v-for="g in [1, 2, 3, 4]"
        :key="g"
        class="grade-btn"
        :class="{ active: grade === g }"
        @click="switchGrade(g)"
      >
        {{ g }}年生
      </button>
    </div>

    <div class="semester-tabs">
      <button
        class="semester-tab"
        :class="{ active: semester === 'first' }"
        @click="switchSemester('first')"
      >
        前期
      </button>
      <button
        class="semester-tab"
        :class="{ active: semester === 'second' }"
        @click="switchSemester('second')"
      >
        後期
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'

const store = useStore()

const semester = computed(() => store.getters['timetable/semester'])
const grade = computed(() => store.getters['timetable/grade'])

/**
 * 学期を切り替える
 *
 * @param {string} sem - 学期コード ('first' | 'second')
 */
const switchSemester = (sem) => {
  void logFirebaseAnalyticsEvent('timetable_semester_change', { semester: sem })
  store.dispatch('timetable/switchSemester', sem)
  // showSnackbar(sem === 'first' ? '前期' : '後期', 'blue-grey', 'mdi-calendar-range')
}

/**
 * 学年を切り替える
 *
 * @param {number} g - 学年 (1〜4)
 */
const switchGrade = (g) => {
  void logFirebaseAnalyticsEvent('timetable_grade_change', { grade: g })
  store.dispatch('timetable/switchGrade', g)
  // showSnackbar(`${g}年生の時間割を表示中`, 'blue-grey', 'mdi-school-outline')
}
</script>

<style scoped>
.grade-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.grade-btn {
  padding: 4px 14px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #888;
  background: #f5f5f5;
  border: 1.5px solid #e0e0e0;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.18s;
}

.grade-btn:hover {
  border-color: #ff9800;
  color: #ff9800;
  background: #fff9f0;
}

.grade-btn.active {
  background: #ff9800;
  border-color: #ff9800;
  color: white;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
}

.semester-tabs {
  display: flex;
  gap: 0;
  border: 1.5px solid #ff9800;
  border-radius: 20px;
  overflow: hidden;
  width: fit-content;
  margin-bottom: 12px;
}

.semester-tab {
  padding: 5px 20px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #ff9800;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.semester-tab.active {
  background: #ff9800;
  color: white;
}
</style>
