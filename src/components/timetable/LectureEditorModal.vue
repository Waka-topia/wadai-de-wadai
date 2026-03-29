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
                <div class="text-caption font-weight-bold text-teal-darken-3">📚 みんなのシラバスから探す</div>
                <div class="text-teal-darken-1" style="font-size: 0.65rem">楽単度や過去のレビューが見れます！</div>
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

          <!-- 講義名（手動入力） -->
          <div class="field-label">講義名 <span class="required">*</span></div>
          <p v-if="!isExistingLecture" class="text-caption text-grey mb-1" style="font-size: 0.7rem">
            ※検索せずに直接追加する場合は以下に入力してください
          </p>
          <v-text-field
            v-model="form.name"
            placeholder="例：基礎プログラミング"
            variant="outlined"
            density="compact"
            :rules="[(v) => !!v || '講義名を入力してください']"
            class="mb-2"
          ></v-text-field>

          <!-- カラー選択 -->
          <div class="field-label">カラー</div>
          <div class="color-palette mb-3">
            <button
              v-for="(colorDef, colorKey) in colorPalette"
              :key="colorKey"
              class="color-swatch"
              :style="{ backgroundColor: colorDef.border }"
              :class="{ 'color-swatch--selected': form.color === colorKey }"
              :title="colorKey"
              type="button"
              @click="form.color = colorKey"
            >
              <v-icon v-if="form.color === colorKey" color="white" size="14">mdi-check</v-icon>
            </button>
          </div>

          <!-- 担当教員 -->
          <div class="field-label">担当教員</div>
          <v-text-field
            v-model="form.teacher"
            variant="outlined"
            placeholder="例：山田 太郎"
            density="compact"
            class="mb-2"
          />

          <!-- 教室 + 単位数（横並び） -->
          <div class="row-fields">
            <div class="row-field flex-grow-1">
              <div class="field-label">教室</div>
              <v-text-field
                v-model="form.room"
                variant="outlined"
                placeholder="例：A棟101"
                density="compact"
              />
            </div>
            <div class="row-field credits-field">
              <div class="field-label">単位数</div>
              <v-select
                v-model="form.credits"
                :items="[0, 1, 2, 3, 4]"
                variant="outlined"
                density="compact"
                suffix=""
              />
            </div>
          </div>

          <!-- 必修区分と取得状況 -->
          <div class="row-fields">
            <div class="row-field" style="max-width: 140px">
              <div class="field-label">区分</div>
              <v-select
                v-model="form.required"
                :items="requiredItems"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
              />
            </div>
            <div class="row-field flex-grow-1 ml-2">
              <div class="field-label">単位取得状況</div>
              <v-select
                v-model="form.creditStatus"
                :items="creditStatusItems"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="compact"
              />
            </div>
          </div>

          <!-- メモ -->
          <div class="field-label">メモ</div>
          <v-textarea
            v-model="form.memo"
            variant="outlined"
            placeholder="例：出席必須, 教科書持参"
            density="compact"
            rows="2"
            class="mb-2"
          />

          <LectureReviewPanel
            v-if="currentLectureName && !isEditMode"
            :lecture-name="currentLectureName"
          />
        </v-card-text>

        <v-card-actions class="modal-actions">
          <v-spacer />
          <v-btn variant="text" @click="isExistingLecture ? (isEditMode = false) : close()"
            >キャンセル</v-btn
          >
          <v-btn color="orange" variant="flat" :disabled="!form.name" @click="handleSave">
            保存
          </v-btn>
        </v-card-actions>
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

/**
 * シラバスパネルに渡す講義名（currentLectureNameの別名 alias）
 * テンプレート内で v-if / :lecture-name に使用
 */
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

/**
 * 保存ボタン押下時の処理
 */
const handleSave = () => {
  if (!props.selectedCell || !form.value.name) return
  executeFinalSave()
}

/** 最終的な保存実行ロジック */
const executeFinalSave = () => {
  const name =
    typeof form.value.name === 'object' && form.value.name !== null
      ? form.value.name.name
      : form.value.name

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

/* フォーム系固有スタイル */
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 4px;
}

.required {
  color: #f44336;
}

/* カラーパレット */
.color-palette {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.12s,
    box-shadow 0.12s;
}

.color-swatch:hover {
  transform: scale(1.15);
}

.color-swatch--selected {
  border-color: #333;
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 横並びフィールド */
.row-fields {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 4px;
}

.row-field {
  min-width: 0;
}

.credits-field {
  width: 100px;
  flex-shrink: 0;
}

.required-field {
  width: 110px;
  flex-shrink: 0;
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
