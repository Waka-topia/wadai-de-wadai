<template>
  <div class="mt-4" :class="isExpanded ? 'syllabus-panel' : ''">
    <template v-if="!isExpanded && !hideToggle">
      <v-btn
        block
        variant="tonal"
        color="teal"
        class="text-body-2 font-weight-bold py-2"
        height="auto"
        @click="expandPanel"
      >
        <v-icon size="18" class="mr-2">mdi-book-open-variant</v-icon>
        みんなのシラバスを見る
      </v-btn>
    </template>

    <template v-else>
      <div class="syllabus-header mb-3">
        <v-icon color="teal" size="20" class="mr-2">mdi-book-open-variant</v-icon>
        <span class="syllabus-title">みんなのシラバス</span>
        <v-spacer></v-spacer>
        <v-btn
          v-if="!isEditing && !hideToggle"
          size="small"
          density="compact"
          variant="text"
          color="grey"
          class="mr-1"
          @click="closePanel"
        >
          閉じる
        </v-btn>
        <v-btn
          v-if="!isEditing && isLoggedIn"
          size="small"
          density="compact"
          variant="text"
          color="teal"
          @click="startEdit"
        >
          <v-icon left size="16">mdi-pencil</v-icon>編集
        </v-btn>
      </div>

      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate size="24" color="teal"></v-progress-circular>
      </div>

      <div v-else-if="!isEditing" class="syllabus-content">
        <!-- 楽単評価パネルをここに統合 -->
        <LectureReviewPanel :lecture-name="lectureName" />

        <template v-if="hasContent">
          <div v-if="syllabus.teacher" class="syllabus-section mt-2">
            <div class="section-title">担当教員</div>
            <div class="section-body">{{ syllabus.teacher }}</div>
          </div>
          <div v-if="syllabus.room" class="syllabus-section">
            <div class="section-title">教室</div>
            <div class="section-body">{{ syllabus.room }}</div>
          </div>
          <div
            v-if="syllabus.categories && syllabus.categories.length > 0"
            class="syllabus-section"
          >
            <div class="section-title">授業区分</div>
            <div class="section-body d-flex flex-wrap gap-1 bg-transparent border-0 pa-0">
              <v-chip
                v-for="cat in syllabus.categories"
                :key="cat"
                size="x-small"
                color="teal"
                variant="flat"
                class="font-weight-bold"
              >
                {{ cat }}
              </v-chip>
            </div>
          </div>
          <div v-if="syllabus.description" class="syllabus-section">
            <div class="section-title">授業概要</div>
            <div class="section-body">{{ syllabus.description }}</div>
          </div>
          <div v-if="syllabus.grading" class="syllabus-section">
            <div class="section-title">評価方法</div>
            <div class="section-body">{{ syllabus.grading }}</div>
          </div>
          <div v-if="syllabus.textbook" class="syllabus-section">
            <div class="section-title">教科書・参考書</div>
            <div class="section-body">{{ syllabus.textbook }}</div>
          </div>

          <div class="syllabus-footer mt-3">
            <v-btn
              v-if="syllabus.previousVersion"
              size="x-small"
              variant="tonal"
              color="blue-grey"
              class="mb-1"
              @click="showHistory = !showHistory"
            >
              <v-icon left size="14">mdi-history</v-icon>
              {{ showHistory ? '履歴を閉じる' : '1つ前の履歴を見る' }}
            </v-btn>

            <div class="footer-meta">
              <v-icon size="12" color="grey" class="mr-1">mdi-account-edit</v-icon>
              最終更新: {{ syllabus.lastEditedBy }}
              <span v-if="updatedDate">({{ updatedDate }})</span>
            </div>
          </div>

          <!-- 履歴表示エリア -->
          <v-expand-transition>
            <div v-if="showHistory && syllabus.previousVersion" class="history-view mt-3">
              <div class="d-flex justify-space-between align-center mb-2">
                <div class="text-caption font-weight-bold text-blue-grey-darken-1">
                  1つ前の内容 (編集者: {{ syllabus.previousVersion.editedBy }})
                </div>
                <v-btn size="x-small" variant="flat" color="blue-grey" @click="restorePrevious">
                  この内容を復元する
                </v-btn>
              </div>

              <div v-if="syllabus.previousVersion.teacher" class="history-text text-caption">
                <strong class="text-grey-darken-1">教員:</strong>
                {{ syllabus.previousVersion.teacher }}
              </div>
              <div v-if="syllabus.previousVersion.room" class="history-text text-caption">
                <strong class="text-grey-darken-1">教室:</strong>
                {{ syllabus.previousVersion.room }}
              </div>
              <div v-if="syllabus.previousVersion.description" class="history-text text-caption">
                <strong class="text-grey-darken-1">概要:</strong>
                {{ syllabus.previousVersion.description }}
              </div>
              <div v-if="syllabus.previousVersion.grading" class="history-text text-caption">
                <strong class="text-grey-darken-1">評価:</strong>
                {{ syllabus.previousVersion.grading }}
              </div>
              <div v-if="syllabus.previousVersion.textbook" class="history-text text-caption">
                <strong class="text-grey-darken-1">教科書:</strong>
                {{ syllabus.previousVersion.textbook }}
              </div>
            </div>
          </v-expand-transition>
        </template>
        <template v-else-if="!isLinkingMode">
          <div class="empty-state text-center py-3">
            <v-icon color="grey-lighten-1" size="32" class="mb-2">mdi-file-document-outline</v-icon>
            <div class="text-caption text-grey">
              まだシラバス情報がありません。<br />あなたが最初の編集者になりませんか？
            </div>
            <v-btn
              v-if="isLoggedIn"
              variant="outlined"
              color="teal"
              size="small"
              class="mt-3"
              @click="handleCreateClick"
            >
              シラバスを作成
            </v-btn>
          </div>
        </template>

        <!-- 名寄せ・紐付け画面 (Smart Registration) -->
        <template v-else-if="isLinkingMode">
          <div class="linking-view py-2">
            <div class="text-subtitle-2 font-weight-bold mb-1">
              <v-icon size="18" color="teal" class="mr-1">mdi-magnify-plus</v-icon>
              既存のシラバスを探す
            </div>
            <p class="text-caption text-grey-darken-1 mb-3">
              「{{ lectureName }}」に近い授業がすでにあるかもしれません。
            </p>

            <div v-if="suggestedMatches.length > 0" class="mb-4">
              <div class="text-caption font-weight-bold mb-2 text-teal-darken-1">
                もしかしてこれですか？
              </div>
              <v-list
                density="compact"
                class="pa-0 bg-transparent rounded-lg border overflow-hidden"
              >
                <v-list-item
                  v-for="match in suggestedMatches"
                  :key="match.name"
                  class="match-item border-bottom"
                  @click="linkToExisting(match.name)"
                >
                  <v-list-item-title class="text-body-2">{{ match.name }}</v-list-item-title>
                  <template #append>
                    <v-btn size="x-small" variant="text" color="teal">紐付ける</v-btn>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <div class="new-registration-box pa-3 rounded-lg bg-teal-lighten-5 border">
              <div class="text-caption font-weight-bold mb-2">新しくシラバスを登録する</div>
              <v-text-field
                v-model="formalNameInput"
                label="正式な授業名 (フルネーム)"
                placeholder="例：プロジェクト工学基礎"
                variant="outlined"
                density="compact"
                hide-details
                class="mb-2 bg-white"
              ></v-text-field>
              <p
                v-if="formalNameInput === lectureName && lectureName.length < 4"
                class="text-error text-caption mb-2"
              >
                ※略称ではなく正式名称を入力してください。
              </p>
              <v-btn
                block
                color="teal"
                variant="flat"
                size="small"
                :disabled="
                  !formalNameInput || (formalNameInput === lectureName && lectureName.length < 3)
                "
                @click="proceedToCreate"
              >
                次へ（内容入力）
              </v-btn>
            </div>

            <v-btn block variant="text" size="small" class="mt-2" @click="cancelEdit">
              キャンセル
            </v-btn>
          </div>
        </template>
      </div>

      <div v-else class="syllabus-edit-form">
        <div class="field-label">担当教員</div>
        <v-text-field
          v-model="editForm.teacher"
          variant="outlined"
          density="compact"
          placeholder="例：山田 太郎"
          class="mb-2"
        ></v-text-field>

        <div class="field-label">教室</div>
        <v-text-field
          v-model="editForm.room"
          variant="outlined"
          density="compact"
          placeholder="例：E101"
          class="mb-2"
        ></v-text-field>

        <div class="field-label">授業概要</div>
        <v-textarea
          v-model="editForm.description"
          variant="outlined"
          density="compact"
          rows="3"
          placeholder="この授業で学ぶこと"
          class="mb-2"
        ></v-textarea>

        <div class="field-label">評価方法</div>
        <v-textarea
          v-model="editForm.grading"
          variant="outlined"
          density="compact"
          rows="2"
          placeholder="期末テスト 50%, レポート 50%"
          class="mb-2"
        ></v-textarea>

        <div class="field-label">授業区分（複数選択可）</div>
        <v-select
          v-model="editForm.categories"
          :items="categoryOptions"
          multiple
          chips
          variant="outlined"
          density="compact"
          placeholder="区分を選択"
          class="mb-2"
        ></v-select>

        <div class="field-label">教科書・参考書</div>
        <v-textarea
          v-model="editForm.textbook"
          variant="outlined"
          density="compact"
          rows="2"
          placeholder="使用するテキストや指定図書"
          class="mb-2"
        ></v-textarea>

        <div class="d-flex justify-end gap-2 mt-2">
          <v-btn variant="text" size="small" @click="cancelEdit">キャンセル</v-btn>
          <v-btn
            color="teal"
            variant="flat"
            size="small"
            :loading="saving"
            :disabled="!canSaveSyllabus"
            @click="saveEdition"
            >保存</v-btn
          >
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { getSyllabus, saveSyllabus } from '@/services/syllabusService'
import { searchSuggestions } from '@/services/lectureIndexService'
import LectureReviewPanel from '@/components/timetable/LectureReviewPanel.vue'
import { formatYmdSlash, toJsDate } from '@/utils/dateFormatter'

const props = defineProps({
  lectureName: {
    type: String,
    required: true,
  },
  defaultExpanded: {
    type: Boolean,
    default: false,
  },
  hideToggle: {
    type: Boolean,
    default: false,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:expanded', 'linked'])

const store = useStore()
const isLoggedIn = computed(() => store.getters['auth/isAuthenticated'])
const uid = computed(() => store.getters['auth/userId'])
const userName = computed(() => store.getters['auth/displayName'] || '匿名ユーザー')

const loading = ref(true)
const isEditing = ref(false)
const isLinkingMode = ref(false) // 名寄せ・紐付けモード
const saving = ref(false)
const showHistory = ref(false)
const isExpanded = ref(props.defaultExpanded)

// Smart Registration ステート
const formalNameInput = ref('')
const suggestedMatches = ref([])

const syllabus = ref({
  description: '',
  grading: '',
  textbook: '',
  teacher: '',
  room: '',
  categories: [],
  lastEditedBy: '',
  updatedAt: null,
  previousVersion: null,
})

const editForm = ref({
  description: '',
  grading: '',
  textbook: '',
  teacher: '',
  room: '',
  categories: [],
})

const categoryOptions = ['一般教養', '経済', 'シス工', '観光', '教育', 'その他']

const hasContent = computed(() => {
  return !!(
    syllabus.value.description ||
    syllabus.value.grading ||
    syllabus.value.textbook ||
    syllabus.value.teacher ||
    syllabus.value.room ||
    (syllabus.value.categories && syllabus.value.categories.length > 0)
  )
})

const updatedDate = computed(() => {
  const date = toJsDate(syllabus.value.updatedAt)
  return date ? formatYmdSlash(date) : ''
})

const loadSyllabus = async () => {
  if (!props.lectureName || !isExpanded.value) return
  loading.value = true
  isEditing.value = false
  try {
    const data = await getSyllabus(props.lectureName)
    if (data) {
      syllabus.value = {
        description: data.description || '',
        grading: data.grading || '',
        textbook: data.textbook || '',
        teacher: data.teacher || '',
        room: data.room || '',
        categories: data.categories || [],
        lastEditedBy: data.lastEditedBy || '匿名ユーザー',
        updatedAt: data.updatedAt || null,
        previousVersion: data.previousVersion || null,
      }
    } else {
      syllabus.value = {
        description: '',
        grading: '',
        textbook: '',
        teacher: '',
        room: '',
        categories: [],
        lastEditedBy: '',
        updatedAt: null,
        previousVersion: null,
      }
    }
  } catch (e) {
    console.error('シラバス取得エラー:', e)
  } finally {
    loading.value = false
  }
}

watch(
  () => props.lectureName,
  () => {
    isExpanded.value = false
    emit('update:expanded', false)
    isEditing.value = false
    showHistory.value = false
  },
)

const expandPanel = () => {
  isExpanded.value = true
  emit('update:expanded', true)
  loadSyllabus()
}

const closePanel = () => {
  isExpanded.value = false
  emit('update:expanded', false)
}

const startEdit = () => {
  editForm.value = {
    description: syllabus.value.description,
    grading: syllabus.value.grading,
    textbook: syllabus.value.textbook,
    teacher: syllabus.value.teacher,
    room: syllabus.value.room,
    categories: [...(syllabus.value.categories || [])],
  }
  isEditing.value = true
}

/** シラバス作成ボタンクリック時のハンドラ 手動入力（private）の場合はまず名寄せ画面へ */
const handleCreateClick = async () => {
  if (props.isPrivate) {
    isLinkingMode.value = true
    formalNameInput.value = props.lectureName

    // 近い名称のシラバスがあるか検索
    try {
      const results = await searchSuggestions(props.lectureName, 5)
      suggestedMatches.value = results || []
    } catch (e) {
      console.warn('Matching check failed during creation', e)
    }
  } else {
    startEdit()
  }
}

/**
 * 既存のマスターシラバスに紐付ける
 *
 * @param {string} masterName - 正式講義名
 */
const linkToExisting = (masterName) => {
  emit('linked', masterName)
  isLinkingMode.value = false
  // 紐付け後は講義名が変わるため再ロードされるはず
}

/** 正式な名前を指定して作成画面へ */
const proceedToCreate = () => {
  if (!formalNameInput.value) return
  // フォームをリセットして編集開始（既存シラバスがないため空フォーム）
  editForm.value = {
    description: '',
    grading: '',
    textbook: '',
    teacher: '',
    room: '',
    categories: [],
  }
  isEditing.value = true
  isLinkingMode.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  isLinkingMode.value = false
}

const restorePrevious = () => {
  if (!syllabus.value.previousVersion) return
  // 前バージョンの内容をエディタにセットして編集モードを開く
  editForm.value = {
    description: syllabus.value.previousVersion.description || '',
    grading: syllabus.value.previousVersion.grading || '',
    textbook: syllabus.value.previousVersion.textbook || '',
    teacher: syllabus.value.previousVersion.teacher || '',
    room: syllabus.value.previousVersion.room || '',
    categories: syllabus.value.previousVersion.categories || [],
  }
  showHistory.value = false
  isEditing.value = true
}

const saveEdition = async () => {
  if (!isLoggedIn.value) return
  saving.value = true
  // 作成時に正式名称が入力されていればそれを使う、なければ現在のpropsの名称を使う
  const saveName = formalNameInput.value || props.lectureName
  try {
    await saveSyllabus(saveName, editForm.value, uid.value, userName.value)

    // もし新しい正式名称で作成した場合は、親に紐付けを通知
    if (saveName !== props.lectureName) {
      emit('linked', saveName)
    }

    await loadSyllabus()
    isEditing.value = false
    formalNameInput.value = ''
  } catch (e) {
    console.error('保存エラー:', e)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (isExpanded.value) {
    loadSyllabus()
  }
})

const isSyllabusChanged = computed(() => {
  return (
    editForm.value.description !== syllabus.value.description ||
    editForm.value.grading !== syllabus.value.grading ||
    editForm.value.textbook !== syllabus.value.textbook ||
    editForm.value.teacher !== syllabus.value.teacher ||
    editForm.value.room !== syllabus.value.room ||
    JSON.stringify(editForm.value.categories) !== JSON.stringify(syllabus.value.categories || [])
  )
})

const canSaveSyllabus = computed(() => {
  return (
    isSyllabusChanged.value &&
    (editForm.value.description ||
      editForm.value.grading ||
      editForm.value.textbook ||
      editForm.value.teacher ||
      editForm.value.room ||
      editForm.value.categories.length > 0)
  )
})
</script>

<style scoped>
.syllabus-panel {
  background: white;
  border: none;
  border-radius: 8px;
  padding: 12px 4px;
}

.syllabus-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.syllabus-title {
  font-size: 0.95rem;
  font-weight: bold;
  color: #00796b;
  white-space: nowrap;
}

.syllabus-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: #555;
  margin-bottom: 4px;
}

.section-body {
  font-size: 0.82rem;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
  background: #f9fbfb;
  padding: 8px 10px;
  border-radius: 6px;
  border-left: 3px solid #b2dfdb;
}

.syllabus-footer {
  font-size: 0.7rem;
  color: #999;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 4px;
}

.footer-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-left: auto;
  white-space: nowrap;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.history-view {
  background: #f0f4f8;
  border-radius: 6px;
  padding: 10px 12px;
  border-left: 3px solid #607d8b;
}

.history-text {
  margin-bottom: 4px;
  white-space: pre-wrap;
  line-height: 1.4;
}
.history-text:last-child {
  margin-bottom: 0;
}

.gap-2 {
  gap: 8px;
}

.match-item {
  transition: background-color 0.2s;
  cursor: pointer;
}
.match-item:hover {
  background-color: #e0f2f1;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.border-bottom:last-child {
  border-bottom: none;
}
.linking-view {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
