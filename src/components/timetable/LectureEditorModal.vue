<template>
  <v-dialog v-model="dialog" max-width="480" persistent scrollable>
    <v-card class="modal-card" rounded="xl" height="65vh" min-height="480" max-height="600">
      <v-card-title class="modal-title">
        <span>{{ selectedCell ? `${dayLabel} ${selectedCell.period}限` : '講義を登録' }}</span>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <!-- 詳細ビュー (リードオンリー) -->
      <template v-if="!isEditMode && isExistingLecture">
        <v-card-text class="modal-body detail-view">
          <div class="detail-header-block mb-4">
            <div class="detail-course-name">{{ form.name }}</div>
            <div class="detail-tags mt-2">
              <v-chip
                size="small"
                :color="colorPalette[form.color]?.border || 'orange'"
                class="mr-2"
                variant="flat"
                text-color="white"
              >
                {{ requiredLabel }}
              </v-chip>
              <v-chip size="small" variant="tonal" class="mr-2">{{ form.credits }}単位</v-chip>
            </div>
          </div>

          <div v-show="!isSyllabusExpanded">
            <v-list density="compact" class="detail-info-list mb-4" bg-color="transparent">
              <v-list-item>
                <template #prepend>
                  <v-icon color="grey-darken-1" size="20" class="mr-3">mdi-account</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{
                  form.teacher || '未設定'
                }}</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="grey-darken-1" size="20" class="mr-3">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title class="text-body-2">{{
                  form.room || '未設定'
                }}</v-list-item-title>
              </v-list-item>

              <v-list-item>
                <template #prepend>
                  <v-icon color="grey-darken-1" size="20" class="mr-3">mdi-school-outline</v-icon>
                </template>
                <v-list-item-title class="text-body-2 d-flex align-center">
                  取得状況：
                  <v-chip
                    size="x-small"
                    :variant="form.creditStatus === 'taking' ? 'tonal' : 'flat'"
                    :color="creditStatusColor"
                    class="ml-2 font-weight-bold"
                  >
                    {{ creditStatusLabel }}
                  </v-chip>
                </v-list-item-title>
              </v-list-item>

              <v-list-item v-if="form.memo">
                <template #prepend>
                  <v-icon color="grey-darken-1" size="20" class="mr-3">mdi-note-text</v-icon>
                </template>
                <v-list-item-title class="text-body-2" style="white-space: pre-wrap">{{
                  form.memo
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <LectureSyllabusPanel
            v-if="selectedLectureName"
            class="mt-0"
            :lecture-name="form.originalName || selectedLectureName"
            :is-private="!form.isFromSyllabus"
            :default-expanded="isSyllabusExpanded"
            @update:expanded="isSyllabusExpanded = $event"
            @linked="handleSyllabusLinked"
          />
        </v-card-text>

        <v-card-actions v-show="!isSyllabusExpanded" class="modal-actions">
          <v-btn variant="text" color="error" @click="confirmDelete">削除</v-btn>
          <v-spacer />
          <v-btn color="orange" variant="flat" @click="isEditMode = true"> 編集する </v-btn>
        </v-card-actions>
      </template>

      <!-- 編集フォーム -->
      <template v-else>
        <v-card-text class="modal-body">
          <!-- シラバス検索への誘導バナー（新規作成時のみ） -->
          <v-alert
            v-if="!isExistingLecture"
            color="teal-lighten-5"
            border="start"
            border-color="teal"
            class="mb-4 pb-2 pt-3 px-3"
            density="compact"
          >
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption font-weight-bold text-teal-darken-3">
                  📚 みんなのシラバスから探す
                </div>
                <div class="text-teal-darken-1" style="font-size: 0.65rem">
                  楽単度や過去のレビューが見れます！
                </div>
              </div>
              <v-btn
                color="teal"
                variant="flat"
                size="small"
                class="font-weight-bold px-3"
                @click="jumpToSyllabusSearch"
              >
                検索する
              </v-btn>
            </div>
          </v-alert>

          <v-form class="editor-form">
            <v-text-field
              v-model="form.name"
              :rules="[required]"
              class="mb-2"
              density="comfortable"
              label="講義名 *"
              placeholder="例：基礎プログラミング"
              variant="outlined"
            >
              <template v-if="!isExistingLecture" #details>
                <div class="text-caption text-grey" style="font-size: 0.72rem">
                  ※検索せずに直接追加する場合は講義名を入力してください
                </div>
              </template>
            </v-text-field>

            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-bold text-grey-darken-1">カラー</span>
              <v-chip size="x-small" variant="tonal">{{ form.color }}</v-chip>
            </div>
            <v-item-group v-model="form.color" class="mb-4 d-flex flex-wrap ga-2" mandatory>
              <v-item
                v-for="(colorDef, colorKey) in colorPalette"
                v-slot="{ isSelected, toggle }"
                :key="colorKey"
                :value="colorKey"
              >
                <v-btn
                  :aria-label="`${colorKey} を選択`"
                  :class="{ 'color-choice--selected': isSelected }"
                  :color="colorDef.border"
                  :variant="isSelected ? 'flat' : 'tonal'"
                  density="comfortable"
                  icon
                  size="small"
                  @click="toggle"
                >
                  <v-icon
                    :icon="isSelected ? 'mdi-check' : 'mdi-palette'"
                    color="white"
                    size="14"
                  />
                </v-btn>
              </v-item>
            </v-item-group>

            <v-text-field
              v-model="form.teacher"
              class="mb-2"
              :rules="[required]"
              density="comfortable"
              label="担当教員"
              placeholder="例：山田 太郎"
              variant="outlined"
            />

            <v-row class="mb-1" dense>
              <v-col cols="8">
                <v-text-field
                  v-model="form.room"
                  :rules="[required]"
                  density="comfortable"
                  label="教室"
                  placeholder="例：A棟101"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="4">
                <v-select
                  v-model="form.credits"
                  :items="[0, 1, 2, 3, 4]"
                  :rules="[required]"
                  density="comfortable"
                  label="単位数"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-row class="mb-1" dense>
              <v-col cols="12">
                <v-select
                  v-model="form.required"
                  :items="requiredItems"
                  :rules="[required]"
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  label="区分"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="form.creditStatus"
                  :items="creditStatusItems"
                  :rules="[required]"
                  density="comfortable"
                  item-title="label"
                  item-value="value"
                  label="単位取得状況"
                  variant="outlined"
                />
              </v-col>
            </v-row>

            <v-textarea
              v-model="form.memo"
              auto-grow
              density="comfortable"
              label="メモ"
              placeholder="例：出席必須, 教科書持参"
              rows="2"
              variant="outlined"
            />
            <v-card-actions class="modal-actions">
              <v-spacer />
              <v-btn variant="text" @click="isExistingLecture ? (isEditMode = false) : close()"
                >キャンセル</v-btn
              >
              <v-btn color="orange" variant="flat" @click="onSubmit">
                保存
              </v-btn>
            </v-card-actions>
          </v-form>

          <LectureReviewPanel
            v-if="currentLectureName && !isEditMode"
            :lecture-name="currentLectureName"
          />
        </v-card-text>
      </template>
    </v-card>
  </v-dialog>

  <!-- 削除確認ダイアログ -->
  <v-dialog v-model="showDeleteConfirm" max-width="320">
    <v-card rounded="xl">
      <v-card-title class="confirm-title">講義を削除しますか？</v-card-title>
      <v-card-text class="confirm-body">
        「{{ currentLectureName }}」をこの時間から削除します。この操作は取り消せません。
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="showDeleteConfirm = false">キャンセル</v-btn>
        <v-btn color="error" variant="flat" @click="handleDelete">削除する</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { logFirebaseAnalyticsEvent } from '@/services/analyticsService'
import { required } from '@/utils/forms/validate'
import LectureSyllabusPanel from '@/components/timetable/LectureSyllabusPanel.vue'
import LectureReviewPanel from '@/components/timetable/LectureReviewPanel.vue'

const props = defineProps({
  modelValue: Boolean,
  selectedCell: {
    type: Object,
    default: null, // { day, period }
  },
})

const emit = defineEmits(['update:modelValue', 'saved', 'deleted'])

const store = useStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

/** カラーパレット定義 */
const colorPalette = {
  orange: { border: '#ff9800' },
  red: { border: '#e91e63' },
  blue: { border: '#2196f3' },
  green: { border: '#4caf50' },
  purple: { border: '#9c27b0' },
  teal: { border: '#009688' },
  indigo: { border: '#3f51b5' },
  brown: { border: '#795548' },
}

/** 必修区分の選択肢 */
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

const form = ref({
  name: '',
  originalName: '',
  color: 'orange',
  room: '',
  memo: '',
  teacher: '',
  credits: 2,
  required: 'none',
  creditStatus: 'taking',
  isFromSyllabus: false,
})

const resetForm = () => {
  form.value = {
    name: '',
    originalName: '',
    color: 'orange',
    room: '',
    memo: '',
    teacher: '',
    credits: 2,
    required: 'none',
    creditStatus: 'taking',
    isFromSyllabus: false,
  }
}

const isEditMode = ref(false)
const isSyllabusExpanded = ref(false)
const showDeleteConfirm = ref(false)

const router = useRouter()

const jumpToSyllabusSearch = () => {
  if (!props.selectedCell) return
  void logFirebaseAnalyticsEvent('lecture_editor_syllabus_search_jump', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
  emit('update:modelValue', false) // モーダルを閉じる
  router.push({
    path: '/syllabus-search',
    state: {
      targetDay: props.selectedCell.day,
      targetPeriod: props.selectedCell.period,
    },
  })
}

const currentLectureName = computed(() => {
  const raw = form.value.name
  return typeof raw === 'object' && raw !== null ? raw.name : raw
})

/** シラバスパネルに渡す講義名（currentLectureNameの別名 alias） テンプレート内で v-if / :lecture-name に使用 */
const selectedLectureName = computed(() => currentLectureName.value)

const requiredLabel = computed(() => {
  const item = requiredItems.find((i) => i.value === form.value.required)
  return item ? item.label : 'その他'
})

const creditStatusLabel = computed(() => {
  const item = creditStatusItems.find((i) => i.value === form.value.creditStatus)
  return item ? item.label : '履修中・未定'
})

const creditStatusColor = computed(() => {
  if (form.value.creditStatus === 'earned') return 'teal'
  if (form.value.creditStatus === 'failed') return 'error'
  return 'grey'
})

const isExistingLecture = computed(() => {
  if (!props.selectedCell) return false
  return !!store.getters['timetable/getLecture'](props.selectedCell.day, props.selectedCell.period)
})

const dayLabel = computed(() => {
  const labels = { mon: '月', tue: '火', wed: '水', thu: '木', fri: '金' }
  return props.selectedCell ? labels[props.selectedCell.day] || '' : ''
})

watch(
  () => props.selectedCell,
  (cell) => {
    if (!cell) {
      isEditMode.value = true
      return
    }
    const lecture = store.getters['timetable/getLecture'](cell.day, cell.period)

    // 既存講義がある場合はリードオンリー（詳細ビュー）、ない場合は編集フォームに設定
    isEditMode.value = !lecture
    isSyllabusExpanded.value = false

    if (lecture) {
      form.value = {
        name: lecture.name || '',
        originalName: lecture.originalName || lecture.name || '',
        color: lecture.color || 'orange',
        room: lecture.room || '',
        memo: lecture.memo || '',
        teacher: lecture.teacher || '',
        credits: lecture.credits !== undefined ? lecture.credits : 2,
        required: lecture.required || 'none',
        creditStatus: lecture.creditStatus || 'taking',
        isFromSyllabus: !!lecture.isFromSyllabus,
      }
    } else {
      resetForm()
    }
  },
)

const onSubmit = async (validationPromise) => {
  const { valid } = await validationPromise
  if (!valid) throw new Error('入力に誤りがあります。')

  executeFinalSave()
}

/** 最終的な保存実行ロジック */
const executeFinalSave = () => {
  const name = typeof form.value.name === 'object' ? form.value.name.name : form.value.name

  void logFirebaseAnalyticsEvent('lecture_editor_save', {
    day: props.selectedCell?.day,
    period: props.selectedCell?.period,
    isExisting: isExistingLecture.value,
  })

  store.dispatch('timetable/saveLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
    lecture: {
      ...form.value,
      name,
      originalName: form.value.originalName || name,
    },
  })
  emit('saved', name)
  close()
}

/**
 * シラバスパネルから紐付け（名寄せ）が完了した際の処理
 *
 * @param {string} masterName - 正式講義名
 */
const handleSyllabusLinked = (masterName) => {
  form.value.originalName = masterName
  form.value.isFromSyllabus = true
  // 紐付け後は即座に保存して反映させる
  executeFinalSave()
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const handleDelete = () => {
  if (!props.selectedCell) return
  void logFirebaseAnalyticsEvent('lecture_editor_delete', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
  store.dispatch('timetable/removeLecture', {
    day: props.selectedCell.day,
    period: props.selectedCell.period,
  })
  showDeleteConfirm.value = false
  emit('deleted')
  close()
}

const close = () => {
  dialog.value = false
}
</script>

<style scoped>
.modal-card {
  overflow: hidden;
  display: flex !important;
  flex-direction: column !important;
}

.modal-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.modal-body {
  padding: 16px 20px;
  overflow-x: hidden;
  flex: 1 1 auto;
  overflow-y: auto;
  scrollbar-gutter: stable;
}

.editor-form {
  display: flex;
  flex-direction: column;
}

/* 詳細ビュー固有スタイル */
.detail-course-name {
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
}

.detail-tags {
  display: flex;
  align-items: center;
}

.detail-info-list {
  background: transparent !important;
}

.color-choice--selected {
  box-shadow:
    0 0 0 2px #fff,
    0 0 0 4px rgba(255, 152, 0, 0.8);
}

.modal-actions {
  padding: 8px 16px 12px;
}

.confirm-title {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  padding: 20px 20px 8px;
}

.confirm-body {
  font-size: 0.88rem;
  color: #555;
  padding: 0 20px 12px;
}
</style>
