<template>
  <v-container class="pa-4 pb-16 search-page-container">
    <!-- 戻るボタンとタイトル -->
    <div class="d-flex align-center mb-4">
      <v-btn
        icon="mdi-arrow-left"
        variant="text"
        size="small"
        class="mr-2"
        @click="router.back()"
      ></v-btn>
      <h2 class="text-h6 font-weight-bold text-teal-darken-2 mb-0">みんなのシラバス検索</h2>
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

    <p class="text-caption text-grey-darken-1 mb-4">
      授業名を入力して「検索」を押してください。シラバスや楽単度をチェックし、そのまま自分の時間割に追加できます。
    </p>

    <!-- 最適化された検索バー -->
    <v-card class="mb-4 rounded-xl elevation-1">
      <v-card-text class="pa-3">
        <div class="d-flex align-center gap-2">
          <v-text-field
            v-model="searchQuery"
            variant="outlined"
            density="compact"
            placeholder="例：基礎プログラミング"
            hide-details
            clearable
            bg-color="white"
            @keyup.enter="executeSearch"
          >
            <template #prepend-inner>
              <v-icon color="grey">mdi-magnify</v-icon>
            </template>
          </v-text-field>
          <v-btn
            color="teal"
            variant="flat"
            height="40"
            class="font-weight-bold px-4"
            :loading="loading"
            @click="executeSearch"
          >
            検索
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 検索結果リスト -->
    <div v-if="hasSearched && !loading">
      <div v-if="suggestions.length === 0" class="text-center py-8">
        <v-avatar color="amber-lighten-4" size="80" class="mb-4">
          <v-icon size="48" color="amber-darken-2">mdi-party-popper</v-icon>
        </v-avatar>
        <p class="text-h6 font-weight-bold text-amber-darken-4 mb-2">
          最初の発見者です！
        </p>
        <p class="text-caption text-grey-darken-2 mb-5 px-4" style="line-height: 1.5;">
          誰のシラバスにもまだ登録されていない授業です。<br>
          あなたが今この授業を追加すれば、<br>
          <strong>和歌山大学で最初のマスターデータ</strong>として刻まれます！
        </p>
        <v-btn color="orange" variant="flat" size="large" class="font-weight-bold px-8 rounded-pill" @click="openNewLectureNameDialog">
          <v-icon left>mdi-crown</v-icon>
          自分が最初の登録者になる
        </v-btn>
      </div>

      <v-card v-else class="rounded-xl elevation-1 mb-4" variant="outlined">
        <v-list lines="two" bg-color="transparent" class="pa-0">
          <template v-for="item in suggestions" :key="item.name">
            <v-list-item :ripple="true" class="py-3" @click="openSyllabusModal(item.name)">
              <v-list-item-title class="font-weight-bold text-body-1">{{
                item.name
              }}</v-list-item-title>
              <template #append>
                <div class="text-right">
                  <v-chip size="small" color="orange" variant="tonal" class="font-weight-bold">
                    {{ item.count }}人 登録済
                  </v-chip>
                </div>
              </template>
            </v-list-item>
            <v-divider></v-divider>
          </template>

          <!-- 検索結果の最後に追加ボタンを置く -->
          <v-list-item class="py-4 bg-grey-lighten-4">
            <div class="text-center w-100">
              <p class="text-caption text-grey-darken-1 mb-2">探している授業が見つかりませんか？</p>
              <v-btn
                color="teal"
                variant="outlined"
                size="small"
                class="font-weight-bold"
                @click="openNewLectureNameDialog"
              >
                <v-icon left>mdi-plus-circle</v-icon>
                新しい授業を作成する
              </v-btn>
            </div>
          </v-list-item>
        </v-list>
      </v-card>
    </div>

    <!-- 初回表示（検索前）の案内 -->
    <div v-else-if="!hasSearched" class="text-center py-8">
      <v-icon size="64" color="teal-lighten-4" class="mb-3">mdi-book-search</v-icon>
      <p class="text-body-2 text-grey">気になる講義名を検索しましょう</p>
    </div>

    <!-- 手動入力セクション（常に画面下部に表示） -->
    <v-divider class="my-6"></v-divider>
    <div class="text-center pb-6">
      <p class="text-caption text-grey mb-2">検索せずに、直接自分の時間割に書き込みたい場合はこちら</p>
      <v-btn variant="tonal" color="blue-grey" size="small" class="font-weight-bold" @click="openDirectAddDialog">
        <v-icon left>mdi-pencil</v-icon>
        直接手動で入力する
      </v-btn>
    </div>

    <!-- シラバス閲覧・登録用モーダル -->
    <v-dialog v-model="showSyllabusModal" max-width="600" scrollable>
      <v-card class="rounded-xl modal-card">
        <v-card-title class="d-flex align-center justify-space-between bg-teal text-white py-3">
          <span class="text-subtitle-1 font-weight-bold ml-1 text-truncate">
            {{ selectedLectureName }}
          </span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            color="white"
            @click="closeModal"
          ></v-btn>
        </v-card-title>
        <v-card-text class="pa-4 modal-body bg-grey-lighten-4">
          <LectureSyllabusPanel
            v-if="selectedLectureName"
            :lecture-name="selectedLectureName"
            :default-expanded="true"
            :hide-toggle="true"
            class="mt-0"
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-3 bg-white">
          <v-btn
            block
            color="orange"
            variant="flat"
            class="font-weight-bold add-btn"
            @click="openAddDialog"
          >
            <v-icon left size="18" class="mr-1">mdi-calendar-plus</v-icon>
            この授業を時間割に追加する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 曜日・時限の選択ダイアログ -->
    <v-dialog v-model="showAddDialog" max-width="320">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-subtitle-1 font-weight-bold text-center">
          追加するコマを選択
        </v-card-title>
        <v-card-text class="pt-2">
          <v-select
            v-model="addForm.day"
            :items="days"
            label="曜日"
            variant="outlined"
            density="compact"
            class="mb-3"
            hide-details
          ></v-select>
          <v-select
            v-model="addForm.period"
            :items="periods"
            label="時限"
            variant="outlined"
            density="compact"
            hide-details
          ></v-select>

          <div v-if="conflictWarning" class="text-caption text-error mt-3 text-center">
            <v-icon size="14" class="mr-1">mdi-alert</v-icon>{{ conflictWarning }}
          </div>
        </v-card-text>
        <v-card-actions class="d-flex justify-end pt-0">
          <v-btn variant="text" size="small" @click="showAddDialog = false">キャンセル</v-btn>
          <v-btn
            color="orange"
            variant="flat"
            size="small"
            :disabled="!addForm.day || !addForm.period"
            :loading="saving"
            @click="addToTimetable"
          >
            追加
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 新規シラバス登録 / 手動追加ダイアログ -->
    <v-dialog v-model="showNewLectureNameDialog" max-width="440">
      <v-card class="rounded-xl pa-2">
        <v-card-title class="text-subtitle-1 font-weight-bold" :class="isManualAddOnly ? 'text-blue-grey-darken-2' : 'text-teal-darken-2'">
          {{ isManualAddOnly ? '時間割に手動で追加' : 'みんなのシラバスに登録' }}
        </v-card-title>
        <v-card-text class="pt-2">
          <p class="text-caption text-grey-darken-1 mb-3">
            {{ isManualAddOnly 
              ? 'マスターデータには登録せず、自分専用のメモとして時間割に追加します。' 
              : 'あなたが最初の登録者です！正式な情報を入力して、みんなが検索できるようにしましょう。' 
            }}
          </p>
          
          <div class="field-label mb-1">授業名</div>
          <v-text-field
            v-model="newLectureName"
            label="正式な授業名"
            variant="outlined"
            density="compact"
            placeholder="例：ロボット工学入門"
            class="mb-3"
            hide-details
          ></v-text-field>

          <template v-if="!isManualAddOnly">
            <v-row dense class="mb-3">
              <v-col cols="8">
                <div class="field-label mb-1">担当教員</div>
                <v-text-field
                  v-model="newTeacher"
                  label="担当教員名"
                  variant="outlined"
                  density="compact"
                  placeholder="例：山田 太郎"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <div class="field-label mb-1">単位数</div>
                <v-select
                  v-model="newCredits"
                  :items="[1, 2, 4]"
                  label="単位"
                  variant="outlined"
                  density="compact"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>

            <div class="field-label mb-1">建物・場所</div>
            <v-select
              v-model="newRoom"
              :items="buildingOptions"
              label="建物名を選択"
              variant="outlined"
              density="compact"
              class="mb-3"
              hide-details
            ></v-select>

            <div class="field-label mb-1">授業区分（複数選択可）</div>
            <v-select
              v-model="newCategories"
              :items="categoryOptions"
              multiple
              chips
              label="授業区分を選択"
              variant="outlined"
              density="compact"
              class="mb-3"
              hide-details
            ></v-select>

            <div class="field-label mb-1">内容説明（簡単でOK）</div>
            <v-textarea
              v-model="newDescription"
              label="授業の内容や評価の雰囲気など"
              variant="outlined"
              density="compact"
              rows="3"
              placeholder="例：ロボットの歴史から最新技術まで学びます。出席重視です。"
              hide-details
              class="mb-1"
            ></v-textarea>
          </template>
        </v-card-text>
        <v-card-actions class="d-flex justify-end pt-0">
          <v-btn variant="text" size="small" @click="showNewLectureNameDialog = false">キャンセル</v-btn>
          <v-btn
            :color="isManualAddOnly ? 'blue-grey' : 'teal'"
            variant="flat"
            size="small"
            class="font-weight-bold px-4"
            :disabled="isManualAddOnly ? !newLectureName : (!newLectureName || !newTeacher || !newRoom || !newCredits || !newDescription)"
            :loading="saving"
            @click="proceedToNextStep"
          >
            {{ isManualAddOnly ? '次へ (コマ選択)' : 'シラバスを登録する' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成功通知用スナックバー -->
    <v-snackbar
      v-model="showSuccessSnackbar"
      color="teal-darken-2"
      elevation="24"
      rounded="pill"
      :timeout="4000"
    >
      <div class="text-center w-100 font-weight-bold">
        <v-icon left class="mr-2">mdi-check-circle</v-icon>
        {{ successMessage }}
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { fetchMasterIndex, saveSyllabusWithIndex } from '@/services/lectureIndexService'
import { getSyllabus } from '@/services/syllabusService'
import LectureSyllabusPanel from '@/components/timetable/LectureSyllabusPanel.vue'
import { normalizeLectureName } from '@/utils/lectureNormalizer'
import { campusBuildings } from '@/data/campusBuildings'

const store = useStore()
const router = useRouter()

// 時間割空きコマからの遷移によるターゲット指定（URLクエリではなく history.state で隠蔽して受け取る）
const targetDay = ref(null)
const targetPeriod = ref(null)

onMounted(async () => {
  // マスターインデックスのロード
  await loadMasterIndex()

  if (history.state && history.state.targetDay) {
    targetDay.value = history.state.targetDay
    targetPeriod.value = Number(history.state.targetPeriod)
    
    // ダイアログ用のフォームにも初期セット
    addForm.value.day = targetDay.value
    addForm.value.period = targetPeriod.value
  }
})

const getDayName = (code) => {
  const map = { mon: '月曜日', tue: '火曜日', wed: '水曜日', thu: '木曜日', fri: '金曜日' }
  return map[code] || ''
}

// 検索ステート
const searchQuery = ref('')
const suggestions = ref([])
const masterIndex = ref({ l: [], updatedAt: null })
const loading = ref(false)
const hasSearched = ref(false)
const isInitialLoading = ref(true)

// オンメモリキャッシュ（APIコール削減）
// アプローチAでは masterIndex がキャッシュを兼ねるため不要になります

const uid = computed(() => store.getters['auth/userId'])
const userName = computed(() => store.getters['auth/displayName'] || '匿名ユーザー')
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])

// シラバス表示・追加ステート
const selectedLectureName = ref(null)
const showSyllabusModal = ref(false)
const showAddDialog = ref(false)
const saving = ref(false)
const showSuccessSnackbar = ref(false)
const successMessage = ref('')

// 新規作成時の中間ステップ用
const showNewLectureNameDialog = ref(false)
const newLectureName = ref('')
const newTeacher = ref('')
const newRoom = ref('')
const newCredits = ref(2)
const newCategories = ref([])
const newDescription = ref('')
const isManualAddOnly = ref(false) // マスター登録せず自分用に追加するモード

const categoryOptions = ['一般教養', '経済', 'シス工', '観光', '教育', 'その他']

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

// 建物リスト（campusBuildings からタイトルを抽出）
const buildingOptions = computed(() => {
  const buildings = campusBuildings.features.map((f) => f.properties.title)
  return [...new Set(buildings), 'オンライン', 'わからない / 場所不明']
})

const addForm = ref({
  day: null,
  period: null,
})

// マスターデータの読み込み
const loadMasterIndex = async () => {
  try {
    masterIndex.value = await fetchMasterIndex()
  } catch (error) {
    console.error('Failed to load master index:', error)
  } finally {
    isInitialLoading.value = false
  }
}

// 定額課金対応の検索アルゴリズム（ローカル検索）
const executeSearch = async () => {
  const queryText = searchQuery.value ? searchQuery.value.trim() : ''
  if (!queryText) return

  loading.value = true
  hasSearched.value = true

  // ローカルでのフィルタリング（爆速・0アクセス）
  const normalizedQuery = normalizeLectureName(queryText)
  const filtered = masterIndex.value.l.filter((item) => {
    return item.id.includes(queryText) || item.n.includes(normalizedQuery)
  })

  // テンプレートの互換性のためにマッピング
  // インデックスの形式 { id, n, t, b, c, g } -> 表示の形式 { name, teacher, room, credits, categories }
  suggestions.value = filtered.map((item) => ({
    name: item.id,
    teacher: item.t,
    room: item.b,
    credits: item.c,
    categories: item.g || [],
    count: 0, // 今後必要ならインデックスに含める
  }))

  loading.value = false
}

const openSyllabusModal = (lectureName) => {
  selectedLectureName.value = lectureName
  showSyllabusModal.value = true
}

const closeModal = () => {
  showSyllabusModal.value = false
  selectedLectureName.value = null
}

const openAddDialog = () => {
  addForm.value.day = null
  addForm.value.period = null
  showAddDialog.value = true
}

// 自分で手動入力して追加する用のダイアログを開く
const openDirectAddDialog = () => {
  newLectureName.value = ''
  newTeacher.value = ''
  newRoom.value = ''
  newCredits.value = 2
  newDescription.value = ''
  isManualAddOnly.value = true
  showNewLectureNameDialog.value = true
}

// 新規作成用の名前確認ダイアログを開く
const openNewLectureNameDialog = () => {
  // 検索窓の文字列をデフォルト表示にする
  newLectureName.value = searchQuery.value ? searchQuery.value.trim() : ''
  newTeacher.value = ''
  newRoom.value = ''
  newCredits.value = 2
  newCategories.value = []
  newDescription.value = ''
  isManualAddOnly.value = false
  showNewLectureNameDialog.value = true
}

// 新規作成ダイアログから、次のステップへ進む
const proceedToNextStep = () => {
  if (!newLectureName.value) return
  
  if (isManualAddOnly.value) {
    // 自分専用の追加（マスター登録スキップ）
    showNewLectureNameDialog.value = false
    selectedLectureName.value = newLectureName.value.trim()
    openAddDialog()
  } else {
    // シラバス（マスター）登録
    registerSyllabus()
  }
}

/**
 * 新規シラバスをマスターデータとして登録する
 */
const registerSyllabus = async () => {
  if (!newLectureName.value || !newTeacher.value || !newRoom.value || !newCredits.value || !newDescription.value) return
  if (!isLoggedIn.value) {
    alert('シラバスを登録するにはログインが必要です。')
    return
  }

  saving.value = true
  const lectureName = newLectureName.value.trim()
  try {
    // 1. 詳細データとインデックスをトランザクションで一括保存（ロールバック保証）
    await saveSyllabusWithIndex(
      lectureName,
      {
        teacher: newTeacher.value.trim(),
        room: newRoom.value.trim(),
        credits: Number(newCredits.value),
        categories: Array.from(newCategories.value),
        description: newDescription.value.trim(),
      },
      uid.value,
      userName.value,
    )

    // 完了フィードバック
    successMessage.value = `「${lectureName}」をみんなのシラバスに登録しました！`
    showSuccessSnackbar.value = true
    
    // ダイアログを閉じてリセット
    showNewLectureNameDialog.value = false
    newLectureName.value = ''
    newTeacher.value = ''
    newRoom.value = ''
    newCredits.value = 2
    newCategories.value = []
    newDescription.value = ''
    
    // インデックスを再起動して検索結果に反映
    await loadMasterIndex()
    searchQuery.value = lectureName
    await executeSearch()
  } catch (error) {
    console.error('Failed to register syllabus:', error)
  } finally {
    saving.value = false
  }
}

// 既に追加予定のコマに別の授業がないかチェック
const conflictWarning = computed(() => {
  if (!addForm.value.day || !addForm.value.period) return ''
  const existing = store.getters['timetable/getLecture'](addForm.value.day, addForm.value.period)
  if (existing) {
    return '※既に授業が登録されています。上書きされます。'
  }
  return ''
})

const addToTimetable = async () => {
  if (!addForm.value.day || !addForm.value.period || !selectedLectureName.value) return

  saving.value = true
  try {
    // シラバス情報から教員名・教室を引く
    let teacher = ''
    let room = ''
    try {
      const syllabusData = await getSyllabus(selectedLectureName.value)
      if (syllabusData) {
        teacher = syllabusData.teacher || ''
        room = syllabusData.room || ''
      }
    } catch (e) {
      console.warn('Failed to fetch syllabus data during timetable addition', e)
    }

    await store.dispatch('timetable/saveLecture', {
      day: addForm.value.day,
      period: addForm.value.period,
      lecture: {
        name: selectedLectureName.value,
        originalName: selectedLectureName.value,
        color: 'orange',
        room,
        memo: '',
        teacher,
        credits: 2,
        required: 'none',
        creditStatus: 'taking',
        isFromSyllabus: true,
      },
    })

    // 成功したらダイアログを閉じて時間割画面へ飛ぶ
    showAddDialog.value = false
    showSyllabusModal.value = false
    router.push('/timetable')
  } catch (error) {
    console.error('Failed to add lecture:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.search-page-container {
  background-color: #fafafa;
  min-height: 100vh;
}
.modal-card {
  height: 85vh;
  display: flex;
  flex-direction: column;
}
.modal-body {
  flex: 1;
  overflow-y: auto;
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
</style>
