<template>
  <v-skeleton-loader v-if="isLoading" type="card"></v-skeleton-loader>
  <v-container class="pa-4 pb-16 search-page-container">
    <div class="d-flex align-center gap-2 mb-4">
      <!-- 戻るボタン -->
      <v-btn icon="mdi-arrow-left" variant="plain" rounded="lg" @click="router.back()" />
      <!-- 検索バー -->
      <v-text-field
        v-model="searchQuery"
        variant="outlined"
        density="compact"
        label="講義名を検索"
        placeholder="ロボット工学入門"
        hide-details
        clearable
        rounded="xl"
        prepend-inner-icon="mdi-magnify"
        clear-icon="mdi-close"
        @keyup.enter="executeSearch"
      />
    </div>

    <!-- ターゲットのコマが指定されている場合の専用バナー -->
    <v-alert
      v-if="targetDay && targetPeriod"
      color="orange-lighten-4"
      icon="mdi-calendar-check"
      class="mb-4 rounded-lg text-orange-darken-4 font-weight-bold px-3 py-2"
      density="compact"
    >
      {{ getDayName(targetDay) }} {{ targetPeriod }}限 に追加する授業
    </v-alert>

    <!-- エラー表示 -->
    <v-alert
      v-if="syllabusError"
      type="error"
      variant="tonal"
      class="mb-4 rounded-lg"
      density="compact"
    >
      {{ syllabusError }}
    </v-alert>

    <!-- 検索中ローディング -->
    <div v-if="isSearching" class="text-center py-8">
      <v-progress-circular indeterminate color="orange" />
    </div>

    <!-- 検索結果リスト -->
    <div v-else-if="isSearched">
      <!-- 検索結果が見つからなかった場合 -->
      <div v-if="suggestions.length === 0" class="text-center py-8">
        <v-avatar color="amber-lighten-4" size="80" class="mb-4">
          <v-icon size="48" color="amber-darken-2">mdi-party-popper</v-icon>
        </v-avatar>
        <p class="text-h6 font-weight-bold text-amber-darken-4 mb-2">最初の発見者です！</p>
        <p class="text-caption text-grey-darken-2 mb-5 px-4" style="line-height: 1.5">
          誰のシラバスにもまだ登録されていない授業です。<br />
          あなたが今この授業を追加すれば、<br />
          <strong>和歌山大学で最初のマスターデータ</strong>として刻まれます！
        </p>
        <v-btn
          color="orange"
          variant="flat"
          size="large"
          class="font-weight-bold px-8 rounded-pill text-white elevation-2"
          @click="openManualAddDialog()"
        >
          <v-icon start>mdi-pencil-plus</v-icon>
          授業を手動で追加する
        </v-btn>
      </div>

      <!-- 検索結果が見つかった場合 -->
      <v-card v-else class="mb-2" variant="plain">
        <v-list lines="one" bg-color="transparent" class="pa-0">
          <template v-for="(item, i) in suggestions" :key="item.name">
            <v-divider v-if="i > 0" />
            <v-list-item :title="item.name" @click="openSyllabusModal(item.name)">
              <template #append>
                <v-chip
                  size="small"
                  :color="item.count > 0 ? 'orange' : 'grey'"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ item.count > 0 ? `${item.count}人 登録済` : '登録者なし' }}
                </v-chip>
              </template>
            </v-list-item>
          </template>
        </v-list>
      </v-card>

      <!-- 授業を手動で追加するボタン（検索結果あり時） -->
      <div class="text-right mb-4">
        <v-btn
          color="grey-darken-2"
          variant="plain"
          size="small"
          class="font-weight-bold"
          @click="openManualAddDialog()"
        >
          <v-icon left>mdi-pencil-plus</v-icon>
          授業を手動で追加する
        </v-btn>
      </div>
    </div>

    <!-- 初回表示（検索前）の案内 -->
    <div v-else-if="!isSearched" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-book-search</v-icon>
      <p class="text-body-2 text-grey">気になる講義名を検索しましょう</p>
    </div>

    <!-- シラバス閲覧・登録用モーダル -->
    <v-bottom-sheet v-model="isSyllabusModalOpen" scrollable>
      <v-card class="modal-card" rounded="t-xl">
        <div class="bottom-sheet-handle" />
        <v-card-title class="d-flex align-center justify-space-between py-3 px-4">
          <span class="text-subtitle-1 font-weight-bold text-truncate">
            {{ selectedLectureName }}
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeModal"></v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4 modal-body">
          <LectureSyllabusPanel
            v-if="selectedLectureName"
            :lecture-name="selectedLectureName"
            :default-expanded="true"
            :hide-toggle="true"
            class="mt-0"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="pa-3">
          <v-btn
            block
            color="orange"
            variant="flat"
            rounded="lg"
            class="font-weight-bold add-btn"
            @click="openManualAddDialogFromSyllabus"
          >
            <v-icon left size="18" class="mr-1">mdi-calendar-plus</v-icon>
            この授業を時間割に追加する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-bottom-sheet>

    <!-- 授業を手動で追加するフォーム -->
    <BaseBottomSheet v-model="isManualAddSheetOpen" title="授業を手動で追加する" scrollable>
      <LectureEditorModal
        v-if="isManualAddSheetOpen"
        :selected-cell="{ day: targetDay, period: targetPeriod, lectureId: null }"
        :prefill-name="prefillLectureName"
        @save="handleEditorSave"
      />
    </BaseBottomSheet>

    <!-- 二択確認ダイアログ -->
    <BaseDialog v-model="isAddChoiceDialogOpen" title="どちらで追加しますか？">
      <div class="d-flex flex-column ga-3 pa-4 py-6">
        <v-btn
          block
          color="orange"
          variant="outlined"
          rounded="pill"
          class="font-weight-bold"
          @click="addPersonalOnly"
        >
          <v-icon start>mdi-account</v-icon>
          自分の時間割にだけ追加する
        </v-btn>
        <v-btn
          block
          color="orange"
          rounded="pill"
          class="font-weight-bold text-white"
          @click="addAndRegisterSyllabus"
        >
          <v-icon start>mdi-earth</v-icon>
          みんなのシラバスにも登録する
        </v-btn>
      </div>
    </BaseDialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import BaseBottomSheet from '@/components/common/BaseBottomSheet.vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import LectureEditorModal from '@/components/timetable/LectureEditorModal.vue'
import LectureSyllabusPanel from '@/components/timetable/LectureSyllabusPanel.vue'

const store = useStore()
const router = useRouter()

// 時間割空きコマからの遷移によるターゲット指定（URLクエリではなく history.state で隠蔽して受け取る）
const targetDay = ref(null)
const targetPeriod = ref(null)

onMounted(async () => {
  // マスターインデックスのロード（取得済みの場合はストアがスキップする）
  await store.dispatch('syllabus/fetchMasterIndex')

  if (history.state && history.state.targetDay) {
    targetDay.value = history.state.targetDay
    targetPeriod.value = Number(history.state.targetPeriod)
  }

  void logFirebaseAnalyticsEvent('view_syllabus_search', {
    hasTimetableTarget: !!(targetDay.value && targetPeriod.value),
  })
})

const getDayName = (code) => {
  const map = { mon: '月曜日', tue: '火曜日', wed: '水曜日', thu: '木曜日', fri: '金曜日' }
  return map[code] || ''
}

// 検索ステート
const searchQuery = ref('')
const isSearched = ref(false)

const suggestions = computed(() => store.getters['syllabus/searchResults'])
const isLoading = computed(() => store.getters['syllabus/isLoading'])
const isSearching = computed(() => store.getters['syllabus/isSearching'])
const syllabusError = computed(() => store.getters['syllabus/error'])

const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])

// シラバス表示・追加ステート
const selectedLectureName = ref(null)
const isSyllabusModalOpen = ref(false)
const isSaving = ref(false)

const { notifySuccess, notifyError } = useSnackbar()

// 手動追加フォーム用
const isManualAddSheetOpen = ref(false)
const prefillLectureName = ref('')
const isAddChoiceDialogOpen = ref(false)
const pendingSaveData = ref(null)

// 定額課金対応の検索（ローカルフィルタリング）
const executeSearch = () => {
  const queryText = searchQuery.value ? searchQuery.value.trim() : ''
  if (!queryText) return

  isSearched.value = true
  store.dispatch('syllabus/searchLectures', queryText)

  void logFirebaseAnalyticsEvent('syllabus_search_execute', {
    queryLength: queryText.length,
    resultCount: suggestions.value.length,
  })
}

const openSyllabusModal = (lectureName) => {
  selectedLectureName.value = lectureName
  isSyllabusModalOpen.value = true
}

const closeModal = () => {
  isSyllabusModalOpen.value = false
  selectedLectureName.value = null
}

// シラバス閲覧モーダルの「この授業を時間割に追加する」から開く
const openManualAddDialogFromSyllabus = () => {
  isSyllabusModalOpen.value = false
  // 選択中の授業名をプリフィル
  const prefill = selectedLectureName.value || ''
  selectedLectureName.value = null
  openManualAddDialog(prefill)
}

// 統合エントリポイント（3ボタンすべてをこれで開く）
const openManualAddDialog = (prefillName = '') => {
  prefillLectureName.value = prefillName || (searchQuery.value ? searchQuery.value.trim() : '')
  isManualAddSheetOpen.value = true
}

// LectureEditorModal の save イベント受け取り → 二択ダイアログへ
const handleEditorSave = (saveData) => {
  pendingSaveData.value = saveData
  isManualAddSheetOpen.value = false
  isAddChoiceDialogOpen.value = true
}

/** フォームの内容を時間割に保存する共通処理 */
const saveToTimetable = async () => {
  isSaving.value = true
  try {
    const { day, periods, lecture } = pendingSaveData.value
    await store.dispatch('timetable/saveLecture', { day, periods, lecture })
    router.push('/timetable')
  } catch (error) {
    console.error('Failed to save lecture:', error)
  } finally {
    isSaving.value = false
  }
}

// 選択A：自分の時間割にだけ追加（シラバス登録なし）
const addPersonalOnly = async () => {
  isAddChoiceDialogOpen.value = false
  await saveToTimetable()
}

// 選択B：みんなのシラバスにも登録してから時間割に追加
const addAndRegisterSyllabus = async () => {
  isAddChoiceDialogOpen.value = false
  await registerAndSave()
}

/** 新規シラバスをマスターデータとして登録し、時間割にも追加する */
const registerAndSave = async () => {
  if (!isLoggedIn.value) {
    notifyError('シラバスを登録するにはログインが必要です。')
    return
  }

  isSaving.value = true
  const lectureName = pendingSaveData.value.lecture.name
  try {
    const { lecture } = pendingSaveData.value
    await store.dispatch('syllabus/registerSyllabus', {
      lectureName,
      syllabusData: {
        teacher: lecture.teacher || '',
        room: lecture.room || '',
        credits: Number(lecture.credits),
        categories: [],
        description: lecture.memo || '',
      },
    })

    // 完了フィードバック
    notifySuccess(`「${lectureName}」をみんなのシラバスに登録しました！`)

    // 再取得後に検索結果に反映
    searchQuery.value = lectureName
    executeSearch()
  } catch (error) {
    console.error('Failed to register syllabus:', error)
  }

  // シラバス登録の成否にかかわらず時間割には追加する
  await saveToTimetable()
}
</script>

<style scoped>
.search-page-container {
  background-color: #fafafa;
  min-height: 100vh;
}
.modal-card {
  height: 85vh;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden;
}
.modal-body {
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
.bottom-sheet-handle {
  width: 36px;
  height: 4px;
  background: #ddd;
  border-radius: 2px;
  margin: 8px auto 0;
}
.add-btn {
  letter-spacing: 1px;
}
.gap-2 {
  gap: 8px;
}
.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 2px;
}
.register-sheet-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 12px 0;
  font-size: 1.1rem;
}
.register-sheet-card {
  max-height: 85vh;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden;
}
.register-sheet-body {
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
}
</style>
