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
    <div v-else-if="hasSearched">
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
    <div v-else-if="!hasSearched" class="text-center py-8">
      <v-icon size="64" color="grey-lighten-1" class="mb-3">mdi-book-search</v-icon>
      <p class="text-body-2 text-grey">気になる講義名を検索しましょう</p>
    </div>

    <!-- シラバス閲覧・登録用モーダル -->
    <v-bottom-sheet v-model="showSyllabusModal" scrollable>
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
    <v-bottom-sheet v-model="showNewLectureNameDialog" scrollable>
      <v-card class="register-sheet-card" rounded="t-xl">
        <div class="bottom-sheet-handle" />
        <v-card-title class="register-sheet-title">
          <v-btn icon variant="text" @click="showNewLectureNameDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <span class="text-subtitle-1 font-weight-bold">授業を手動で追加する</span>
          <v-btn
            color="orange"
            variant="text"
            class="font-weight-bold"
            :disabled="!newLectureName || !newDay || newPeriods.length === 0"
            :loading="saving"
            @click="proceedToAddChoice"
          >
            追加する
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-4 register-sheet-body">
          <div class="mb-4">
            <v-select
              v-model="newQuarterSelectValue"
              :items="quarterSelectOptions"
              item-title="title"
              item-value="value"
              label="履修期間 *"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <div class="mb-4">
            <v-select
              v-model="newDay"
              :items="days"
              item-title="title"
              item-value="value"
              label="曜日 *"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <div class="mb-4">
            <v-select
              v-model="newPeriods"
              :items="periods"
              item-title="title"
              item-value="value"
              multiple
              chips
              closable-chips
              label="時限（複数選択で連続コマ）*"
              variant="outlined"
              density="comfortable"
            />
          </div>

          <v-text-field
            v-model="newLectureName"
            class="mb-2"
            density="comfortable"
            label="講義名 *"
            placeholder="例：ロボット工学入門"
            variant="outlined"
          />

          <v-text-field
            v-model="newTeacher"
            class="mb-2"
            density="comfortable"
            label="担当教員"
            placeholder="例：山田 太郎"
            variant="outlined"
          />

          <v-row class="mb-1" dense>
            <v-col cols="8">
              <v-text-field
                v-model="newRoom"
                density="comfortable"
                label="教室"
                placeholder="例：A棟101"
                variant="outlined"
              />
            </v-col>
            <v-col cols="4">
              <v-select
                v-model="newCredits"
                :items="[0, 1, 2, 3, 4]"
                density="comfortable"
                label="単位数"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-row class="mb-1" dense>
            <v-col cols="12">
              <v-select
                v-model="newRequired"
                :items="requiredItems"
                density="comfortable"
                item-title="label"
                item-value="value"
                label="区分"
                variant="outlined"
              />
            </v-col>
            <v-col cols="12">
              <v-select
                v-model="newCreditStatus"
                :items="creditStatusItems"
                density="comfortable"
                item-title="label"
                item-value="value"
                label="単位取得状況"
                variant="outlined"
              />
            </v-col>
          </v-row>

          <v-textarea
            v-model="newMemo"
            auto-grow
            density="comfortable"
            label="メモ"
            placeholder="例：出席必須, 教科書持参"
            rows="2"
            variant="outlined"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

    <!-- 二択確認ダイアログ -->
    <v-dialog v-model="showAddChoiceDialog" max-width="320">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-subtitle-1 font-weight-bold text-center pt-4">
          どちらで追加しますか？
        </v-card-title>
        <v-card-text class="d-flex flex-column ga-3 pb-2">
          <v-btn
            block
            color="blue-grey"
            variant="tonal"
            rounded="lg"
            class="font-weight-bold"
            @click="addPersonalOnly"
          >
            <v-icon start>mdi-account</v-icon>
            自分の時間割にだけ追加する
          </v-btn>
          <v-btn
            block
            color="teal"
            variant="tonal"
            rounded="lg"
            class="font-weight-bold"
            @click="addAndRegisterSyllabus"
          >
            <v-icon start>mdi-earth</v-icon>
            みんなのシラバスにも登録する
          </v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useSnackbar } from '@/composables/useSnackbar'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
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
const hasSearched = ref(false)

const suggestions = computed(() => store.getters['syllabus/searchResults'])
const isLoading = computed(() => store.getters['syllabus/isLoading'])
const isSearching = computed(() => store.getters['syllabus/isSearching'])
const syllabusError = computed(() => store.getters['syllabus/error'])

const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])

// シラバス表示・追加ステート
const selectedLectureName = ref(null)
const showSyllabusModal = ref(false)
const saving = ref(false)

const { showSnackbar } = useSnackbar()

// 手動追加フォーム用
const showNewLectureNameDialog = ref(false)
const showAddChoiceDialog = ref(false)
const newLectureName = ref('')
const newTeacher = ref('')
const newRoom = ref('')
const newCredits = ref(2)
const newRequired = ref('none')
const newCreditStatus = ref('taking')
const newMemo = ref('')
const newDay = ref(null)
const newPeriods = ref([])
const newQuarters = ref([])

const requiredItems = [
  { label: '必修', value: 'req' },
  { label: '選択必修', value: 'semi' },
  { label: 'その他', value: 'none' },
]
const creditStatusItems = [
  { label: '履修中・未定', value: 'taking' },
  { label: '取得済', value: 'earned' },
  { label: '落単', value: 'failed' },
]

const currentSemester = computed(() => store.getters['timetable/semester'])
const currentDisplayQuarter = computed(() => store.state.timetable.displayQuarter)
const availableQuarters = computed(() =>
  currentSemester.value === 'second' ? ['3Q', '4Q'] : ['1Q', '2Q'],
)
const quarterSelectOptions = computed(() => {
  if (currentSemester.value === 'second') {
    return [
      { title: '3Q', value: '3Q' },
      { title: '4Q', value: '4Q' },
      { title: '後期（3Q・4Q）', value: '3Q,4Q' },
    ]
  } else {
    return [
      { title: '1Q', value: '1Q' },
      { title: '2Q', value: '2Q' },
      { title: '前期（1Q・2Q）', value: '1Q,2Q' },
    ]
  }
})
const newQuarterSelectValue = computed({
  get() {
    return (newQuarters.value ?? []).join(',')
  },
  set(val) {
    newQuarters.value = val ? val.split(',') : [...availableQuarters.value]
  },
})

const days = [
  { title: '月曜日', value: 'mon' },
  { title: '火曜日', value: 'tue' },
  { title: '水曜日', value: 'wed' },
  { title: '木曜日', value: 'thu' },
  { title: '金曜日', value: 'fri' },
]

const periods = [
  { title: '1限 (9:10~10:40)', value: 1 },
  { title: '2限 (10:40~12:10)', value: 2 },
  { title: '3限 (13:10~14:40)', value: 3 },
  { title: '4限 (14:50~16:20)', value: 4 },
  { title: '5限 (16:20~17:50)', value: 5 },
  { title: '6限 (18:00~19:30)', value: 6 },
]

// 定額課金対応の検索（ローカルフィルタリング）
const executeSearch = () => {
  const queryText = searchQuery.value ? searchQuery.value.trim() : ''
  if (!queryText) return

  hasSearched.value = true
  store.dispatch('syllabus/searchLectures', queryText)

  void logFirebaseAnalyticsEvent('syllabus_search_execute', {
    queryLength: queryText.length,
    resultCount: suggestions.value.length,
  })
}

const openSyllabusModal = (lectureName) => {
  selectedLectureName.value = lectureName
  showSyllabusModal.value = true
}

const closeModal = () => {
  showSyllabusModal.value = false
  selectedLectureName.value = null
}

// シラバス閲覧モーダルの「この授業を時間割に追加する」から開く
const openManualAddDialogFromSyllabus = () => {
  showSyllabusModal.value = false
  // 選択中の授業名をプリフィル
  const prefill = selectedLectureName.value || ''
  selectedLectureName.value = null
  openManualAddDialog(prefill)
}

// 統合エントリポイント（3ボタンすべてをこれで開く）
const openManualAddDialog = (prefillName = '') => {
  newLectureName.value = prefillName || (searchQuery.value ? searchQuery.value.trim() : '')
  newTeacher.value = ''
  newRoom.value = ''
  newCredits.value = 2
  newRequired.value = 'none'
  newCreditStatus.value = 'taking'
  newMemo.value = ''
  newDay.value = targetDay.value || null
  newPeriods.value = targetPeriod.value ? [targetPeriod.value] : []
  const defaultQuarters =
    currentDisplayQuarter.value !== 'all' && currentDisplayQuarter.value
      ? [currentDisplayQuarter.value]
      : [...availableQuarters.value]
  newQuarters.value = defaultQuarters
  showNewLectureNameDialog.value = true
}

// ヘッダーの「追加する」ボタン → 二択ダイアログを表示
const proceedToAddChoice = () => {
  if (!newLectureName.value) return
  showAddChoiceDialog.value = true
}

/** フォームの内容を時間割に保存する共通処理 */
const saveToTimetable = async () => {
  saving.value = true
  try {
    await store.dispatch('timetable/saveLecture', {
      day: newDay.value,
      periods: newPeriods.value,
      lecture: {
        name: newLectureName.value.trim(),
        originalName: newLectureName.value.trim(),
        color: 'orange',
        room: newRoom.value.trim(),
        memo: newMemo.value.trim(),
        teacher: newTeacher.value.trim(),
        credits: Number(newCredits.value),
        required: newRequired.value,
        creditStatus: newCreditStatus.value,
        isFromSyllabus: false,
        quarters: newQuarters.value,
        periods: newPeriods.value,
        day: newDay.value,
      },
    })
    showNewLectureNameDialog.value = false
    router.push('/timetable')
  } catch (error) {
    console.error('Failed to save lecture:', error)
  } finally {
    saving.value = false
  }
}

// 選択A：自分の時間割にだけ追加（シラバス登録なし）
const addPersonalOnly = async () => {
  showAddChoiceDialog.value = false
  await saveToTimetable()
}

// 選択B：みんなのシラバスにも登録してから時間割に追加
const addAndRegisterSyllabus = async () => {
  showAddChoiceDialog.value = false
  await registerAndSave()
}

/** 新規シラバスをマスターデータとして登録し、時間割にも追加する */
const registerAndSave = async () => {
  if (!isLoggedIn.value) {
    showSnackbar('シラバスを登録するにはログインが必要です。', 'error', {
      icon: 'mdi-alert-circle',
    })
    return
  }

  saving.value = true
  const lectureName = newLectureName.value.trim()
  try {
    await store.dispatch('syllabus/registerSyllabus', {
      lectureName,
      syllabusData: {
        teacher: newTeacher.value.trim(),
        room: newRoom.value.trim(),
        credits: Number(newCredits.value),
        categories: [],
        description: newMemo.value.trim(),
      },
    })

    // 完了フィードバック
    showSnackbar(`「${lectureName}」をみんなのシラバスに登録しました！`, {
      icon: 'mdi-check-circle',
    })

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
